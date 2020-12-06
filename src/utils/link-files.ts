import {
  ensureSymlink,
  pathExists,
  readdir,
  Dirent,
  ensureDir,
} from 'fs-extra';
import { join } from 'path';
import { map, cond, always } from './composables';
import {
  LinkedFiles,
  linkedFilesFactory,
  mergeLinkedFiles,
  FileType,
} from './linked-files';
import { isFileOrSymlink, isFolder, getType } from './fs-helpers';

export type LinkOptions = {
  from: string;
  to: string;
  dryRun?: boolean;
};

export default function linkFilesInDirRecursively(options: LinkOptions) {
  return async (path?: Dirent): Promise<LinkedFiles> => {
    const { to, from } = options;
    const linkDirection: LinkOptions = {
      dryRun: options.dryRun,
      from: join(from, path?.name || ''),
      to: join(to, path?.name || ''),
    };

    return cond([
      [matches(/ignore/), ignoreDirEnt(linkDirection)],
      [pathExists, processFolder(linkDirection)],
      [always, createFolder(linkDirection)],
    ])(linkDirection.to);
  };
}

function processFolder(linkDirection: LinkOptions) {
  return (): Promise<LinkedFiles> =>
    readdir(linkDirection.from, { withFileTypes: true })
      .then(
        map(
          cond([
            [matches(/ignore/), ignoreDirEnt(linkDirection)],
            [isFileOrSymlink, linkFile(linkDirection)],
            [isFolder, linkFilesInDirRecursively(linkDirection)],
          ]),
        ),
      )
      .then(mergeLinkedFiles);
}

function ignoreDirEnt({ to }: LinkOptions) {
  return (dirent: Dirent | string): Promise<LinkedFiles> => {
    const ignored =
      typeof dirent === 'string'
        ? [{ name: dirent, type: FileType.DIR }]
        : [{ name: join(to, dirent.name), type: getType(dirent) }];

    return Promise.resolve(linkedFilesFactory({ ignored }));
  };
}

function createFolder({ to, dryRun }: LinkOptions) {
  return async (): Promise<LinkedFiles> => {
    if (!dryRun) await ensureDir(to);
    return linkedFilesFactory({
      linked: [{ name: to, type: FileType.DIR }],
    });
  };
}

function linkFile({ to, from, dryRun }: LinkOptions) {
  return async (dirent: Dirent): Promise<LinkedFiles> => {
    if (await pathExists(path(to))) {
      return linkedFilesFactory({
        failed: [{ name: path(to), type: FileType.FILE }],
      });
    }

    if (!dryRun) await ensureSymlink(path(from), path(to));

    return linkedFilesFactory({
      linked: [{ name: path(to), type: FileType.FILE }],
    });

    function path(path: string): string {
      return join(path, dirent.name);
    }
  };
}

function matches(pattern: RegExp) {
  return async (str: Dirent | string): Promise<boolean> => {
    return Promise.resolve(
      pattern.test(typeof str === 'string' ? str : str.name),
    );
  };
}
