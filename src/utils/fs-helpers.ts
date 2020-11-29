import { Dirent } from 'fs-extra';

export function isFileOrSymlink(f: Dirent): Promise<boolean> {
  return Promise.resolve(f.isFile() || f.isSymbolicLink());
}

export function isFolder(f: Dirent): Promise<boolean> {
  return Promise.resolve(f.isDirectory());
}
