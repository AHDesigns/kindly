import { Command } from '@oclif/command';
import {
  ensureSymlink,
  pathExists,
  ensureDir,
  readdir,
  Dirent,
} from 'fs-extra';
import { join } from 'path';
import { not } from '../utils/fns';

export default class LinkDotfiles extends Command {
  static description =
    'link all files and folders from [src] to [target]. See "configure --help" for details on [src] and [target]';

  static examples = [`$ kindly link-dotfiles`];

  async run(): Promise<void> {
    const src = join(process.cwd(), 'tmp');
    const target = join(process.cwd(), 'target');
    const res = await processFolder(target, src)();
    this.log(JSON.stringify(res, null, 2));
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
        forEach(
          unless(matches(/ignore/)),
          match([
            [isFile, linkFile(target, src)],
            [isDir, processFolder(target, src)], // src/b
          ]),
        ),
      )
      .then(flatten);
  };
}

function flatten<T>(args: T[][]): T[] {
  return args.reduce(
    (flattened, item) => item.reduce((p, c) => p.concat(c), flattened),
    [],
  );
}

type FilePredicate = (dirent: Dirent) => boolean;
type FileHandler = (dirent: Dirent) => Promise<string[]>;

function linkFile(target: string, src: string) {
  return async (dirent: Dirent): Promise<string[]> => {
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
}

function isFile(dirent: Dirent): boolean {
  return true;
}
function isDir(dirent: Dirent): boolean {
  return true;
}

function match(branches: [FilePredicate, FileHandler][]) {
  return async (dirent: Dirent): Promise<string[]> => {
    for await (const [predicate, handler] of branches) {
      if (predicate(dirent)) {
        return handler(dirent);
      }
    }
    throw new Error('pop');
  };
}

function matches(pattern: RegExp) {
  return (str: Dirent): boolean => {
    return pattern.test(str.name);
  };
}

function forEach<T, S>(predicate: (t: T) => boolean, fn: (t: T) => Promise<S>) {
  return async (t: T[]): Promise<S[]> => {
    return Promise.all(t.filter(predicate).map(fn));
  };
}

function unless<T>(predicate: (t: T) => boolean) {
  return (t: T): boolean => {
    return not(predicate(t));
  };
}
