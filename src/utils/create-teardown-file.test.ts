import { writeFile } from 'fs-extra';
import { FileInfo, FileType } from './linked-files';
import createTeardownFile from './create-teardown-file';

const { FILE, DIR } = FileType;

jest.mock('fs-extra');
jest.mock('./constants', () => ({
  teardownLocation: 'some/path'
}));

describe('createTeardownFile', () => {
  it('writes a JSON file of all the LinkedFiles', async () => {
    const path = 'some/path';
    const input: FileInfo[] = [
      { name: 'fileA', type: FILE },
      { name: 'fileB', type: FILE },
      { name: 'folderA/fileB', type: FILE },
      { name: 'folderB/folderC/fileB', type: FILE },
      { name: 'folderB/folderC', type: DIR },
    ];

    const fileContents = [
      { name: 'fileA', type: 'FILE' },
      { name: 'fileB', type: 'FILE' },
      { name: 'folderA/fileB', type: 'FILE' },
      { name: 'folderB/folderC/fileB', type: 'FILE' },
      { name: 'folderB/folderC', type: 'DIR' },
    ];

    await createTeardownFile(input);

    expect(writeFile).toBeCalledWith(path, fileContents);
  });
});
