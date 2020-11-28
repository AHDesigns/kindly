import { Command } from '@oclif/command';
import {
  ensureSymlink,
  pathExists,
  ensureDir,
  readdir,
  Dirent,
} from 'fs-extra';
import { join } from 'path';
import { collect, unless, flatten } from '../utils/fns';

export default class LinkDotfiles extends Command {
  static description =
    'link all files and folders from [src] to [target]. See "configure --help" for details on [src] and [target]';

  static examples = [`$ kindly link-dotfiles`];

  async run(): Promise<void> {
    const src = join(process.cwd(), 'tmp');
    const target = join(process.cwd(), 'target');
    const res = await processFolder(target, src)();
    // this.log(JSON.stringify(res, null, 2));
    this.log('Done');
  }
}

function processFolder(targetRoot: string, srcRoot: string) {
  return async (path?: Dirent): Promise<string[]> => {
    const target = join(targetRoot, path?.name || '');
    const src = join(srcRoot, path?.name || '');

    await ensureDir(target);

    return readdir(src, { withFileTypes: true })
      .then(
        collect(
          unless(matches(/ignore/)),
          match([
            [(f: Dirent) => f.isFile(), linkFile(target, src)],
            [(f: Dirent) => f.isDirectory(), processFolder(target, src)],
            [(f: Dirent) => f.isSymbolicLink(), linkFile(target, src)],
          ]),
        ),
      )
      .then(flatten);
  };
}

function linkFile(target: string, src: string) {
  const processFile: Handler<Dirent, Promise<string[]>> = async (dirent) => {
    const pathTo = (path: string): string => join(path, dirent.name);
    if (await pathExists(pathTo(target))) {
      return [
        `✘ file "${pathTo(
          target,
        )}" already exists; you'll need to remove it manually`,
      ];
    }
    await ensureSymlink(pathTo(src), pathTo(target));
    return [`✔️ file "${pathTo(target)}" linked`];
  };

  return processFile;
}

interface Predicate<T> {
  (t: T): boolean;
}
interface Handler<T, Y> {
  (t: T): Y;
}

function match<Y, Z>(branches: [Predicate<Y>, Handler<Y, Promise<Z>>][]) {
  return async (dirent: Y): Promise<Z> => {
    for await (const [predicate, handler] of branches) {
      if (predicate(dirent)) {
        return handler(dirent);
      }
    }
    throw new Error('no match');
  };
}

function matches(pattern: RegExp) {
  return (str: Dirent): boolean => {
    return pattern.test(str.name);
  };
}
