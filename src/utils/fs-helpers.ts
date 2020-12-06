import { Dirent } from 'fs-extra';
import { FileType } from './linked-files';

export function isFileOrSymlink(f: Dirent): Promise<boolean> {
  return Promise.resolve(f.isFile() || f.isSymbolicLink());
}

export function isFolder(f: Dirent): Promise<boolean> {
  return Promise.resolve(f.isDirectory());
}

export function getType(f: Dirent): FileType {
  if (f.isSymbolicLink()) return FileType.LINK;
  if (f.isDirectory()) return FileType.DIR;
  if (f.isFile()) return FileType.FILE;

  throw new Error(`dirent "${f.name}" does not have a valid type`);
}
