import { ensureSymlink, pathExists, readdir, Dirent } from 'fs-extra';
import { join } from 'path';
import { map, cond, always } from '../utils/fns';
import {
  LinkedFiles,
  linkedFilesFactory,
  mergeLinkedFiles,
} from './linked-files';
import { isFileOrSymlink, isFolder } from '../utils/fs-helpers';

export type LinkDirection = {
  from: string;
  to: string;
};

export default function linkFilesInDirRecursively({ from, to }: LinkDirection) {
  return async (path?: Dirent): Promise<LinkedFiles> => {
    const linkDirection: LinkDirection = {
      from: join(from, path?.name || ''),
      to: join(to, path?.name || ''),
    };

    return cond([
      [matches(/ignore/), ignoreDirEnt(linkDirection)],
      [pathExists, processFolder(linkDirection)],
      [always, symlinkFolder(linkDirection)],
    ])(linkDirection.to);
  };
}

function processFolder(linkDirection: LinkDirection) {
  return () =>
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

function ignoreDirEnt({ to }: LinkDirection) {
  return async (dirent: Dirent | string) => {
    const ignored =
      typeof dirent === 'string' ? [dirent] : [join(to, dirent.name)];
    return linkedFilesFactory({ ignored });
  };
}

function symlinkFolder({ from, to }: LinkDirection) {
  return async (): Promise<LinkedFiles> => {
    await ensureSymlink(from, to);
    return linkedFilesFactory({ linked: [to] });
  };
}

function linkFile({ to, from }: LinkDirection) {
  return async (dirent: Dirent): Promise<LinkedFiles> => {
    if (await pathExists(path(to))) {
      return linkedFilesFactory({ failed: [path(to)] });
    }

    await ensureSymlink(path(from), path(to));

    return linkedFilesFactory({ linked: [path(to)] });

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
