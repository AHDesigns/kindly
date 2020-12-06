import { writeFile } from 'fs-extra';
import { FileInfo } from './linked-files';
import { teardownLocation } from './constants';

export default async function createTeardownFile(
  linkedFiles: FileInfo[],
): Promise<void> {
  return writeFile(teardownLocation, linkedFiles);
}
