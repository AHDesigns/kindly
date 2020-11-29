import { ensureSymlink, pathExists, readdir, Dirent } from 'fs-extra';
import { join } from 'path';
import { map, cond, always } from './composables';
import {
  LinkedFiles,
  linkedFilesFactory,
  mergeLinkedFiles,
} from './linked-files';
import { isFileOrSymlink, isFolder } from './fs-helpers';

export type LinkDirection = {
  from: string;
  to: string;
};

export type LinkOptions = {
  dryRun?: boolean;
};

export default function linkFilesInDirRecursively(
  { from, to }: LinkDirection,
  options: LinkOptions,
) {
  return async (path?: Dirent): Promise<LinkedFiles> => {
    const linkDirection: LinkDirection = {
      from: join(from, path?.name || ''),
      to: join(to, path?.name || ''),
    };

    return cond([
      [matches(/ignore/), ignoreDirEnt(linkDirection)],
      [pathExists, processFolder(linkDirection, options)],
      [always, symlinkFolder(linkDirection, options)],
    ])(linkDirection.to);
  };
}

function processFolder(linkDirection: LinkDirection, options: LinkOptions) {
  return (): Promise<LinkedFiles> =>
    readdir(linkDirection.from, { withFileTypes: true })
      .then(
        map(
          cond([
            [matches(/ignore/), ignoreDirEnt(linkDirection)],
            [isFileOrSymlink, linkFile(linkDirection, options)],
            [isFolder, linkFilesInDirRecursively(linkDirection, options)],
          ]),
        ),
      )
      .then(mergeLinkedFiles);
}

function ignoreDirEnt({ to }: LinkDirection) {
  return (dirent: Dirent | string): Promise<LinkedFiles> => {
    const ignored =
      typeof dirent === 'string' ? [dirent] : [join(to, dirent.name)];
    return Promise.resolve(linkedFilesFactory({ ignored }));
  };
}

function symlinkFolder({ from, to }: LinkDirection, options: LinkOptions) {
  return async (): Promise<LinkedFiles> => {
    if (!options.dryRun) await ensureSymlink(from, to);

    return linkedFilesFactory({ linked: [to] });
  };
}

function linkFile({ to, from }: LinkDirection, options: LinkOptions) {
  return async (dirent: Dirent): Promise<LinkedFiles> => {
    if (await pathExists(path(to))) {
      return linkedFilesFactory({ failed: [path(to)] });
    }

    if (!options.dryRun) await ensureSymlink(path(from), path(to));

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
