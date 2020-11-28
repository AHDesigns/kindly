import {
  ensureSymlink,
  pathExists,
  readdir,
  Dirent,
  access,
  constants,
} from 'fs-extra';
import { join } from 'path';
import { map, doWhen, notP } from '../utils/fns';

export type LinkDirection = {
  from: string;
  to: string;
};

export type LinkedFilesResult = {
  linked: string[];
  failed: string[];
  ignored: string[];
};

export default function linkFilesInDirRecursively({ from, to }: LinkDirection) {
  return async (path?: Dirent): Promise<LinkedFilesResult> => {
    const linkDirection: LinkDirection = {
      from: join(from, path?.name || ''),
      to: join(to, path?.name || ''),
    };

    if (/ignore/.test(linkDirection.to)) {
      return { linked: [], failed: [], ignored: [linkDirection.to] };
    }

    return doWhen([
      [matches(/ignore/), ignore],
      [notP(folderExists), symlinkFolder(linkDirection)],
      [folderExists, processFolder],
    ])(linkDirection.to);

    function processFolder() {
      return readdir(linkDirection.from, { withFileTypes: true })
        .then(
          map(
            doWhen([
              [matches(/ignore/), ignoreDirEnt(linkDirection)],
              [isFileOrSymlink, linkFile(linkDirection)],
              [isFolder, linkFilesInDirRecursively(linkDirection)],
            ]),
          ),
        )
        .then(mergeLinkedFilesResults);
    }

    function ignore(_: string): Promise<LinkedFilesResult> {
      return Promise.resolve({
        linked: [],
        failed: [],
        ignored: [linkDirection.to],
      });
    }
  };
}

function ignoreDirEnt({ to }: LinkDirection) {
  return async (dirent: Dirent) => {
    return {
      linked: [],
      failed: [],
      ignored: [pathFor(dirent)(to)],
    };
  };
}
function symlinkFolder({ from, to }: LinkDirection) {
  return async (): Promise<LinkedFilesResult> => {
    await ensureSymlink(from, to);
    return {
      linked: [to],
      failed: [],
      ignored: [],
    };
  };
}

async function folderExists(folder: string): Promise<boolean> {
  try {
    await access(folder, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

function mergeLinkedFilesResults(
  linkedFilesResults: LinkedFilesResult[],
): LinkedFilesResult {
  const initial: LinkedFilesResult = { failed: [], linked: [], ignored: [] };
  return linkedFilesResults.reduce(
    (combined, { failed, linked, ignored }) => ({
      failed: [...combined.failed, ...failed],
      linked: [...combined.linked, ...linked],
      ignored: [...combined.ignored, ...ignored],
    }),
    initial,
  );
}

function isFileOrSymlink(f: Dirent) {
  return Promise.resolve(f.isFile() || f.isSymbolicLink());
}

function isFolder(f: Dirent) {
  return Promise.resolve(f.isDirectory());
}
function pathFor(dirent: Dirent) {
  return (path: string): string => join(path, dirent.name);
}

function linkFile({ to, from }: LinkDirection) {
  return async (dirent: Dirent): Promise<LinkedFilesResult> => {
    const path = pathFor(dirent);
    if (await pathExists(path(to))) {
      return {
        linked: [],
        failed: [path(to)],
        ignored: [],
      };
    }
    await ensureSymlink(path(from), path(to));
    return {
      linked: [path(to)],
      failed: [],
      ignored: [],
    };
  };
}

function matches(pattern: RegExp) {
  return async (str: Dirent | string): Promise<boolean> => {
    return Promise.resolve(
      pattern.test(typeof str === 'string' ? str : str.name),
    );
  };
}
