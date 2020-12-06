import {
  LinkedFiles,
  linkedFilesFactory,
  FileType,
  mergeLinkedFiles,
} from './linked-files';

const { FILE, DIR } = FileType;

describe('linked-files', () => {
  describe('linkedFilesFactory', () => {
    let result: LinkedFiles;
    let arg: Partial<LinkedFiles> | undefined;

    beforeEach(() => {
      result = linkedFilesFactory(arg);
    });

    describe('when called without args', () => {
      beforeAll(() => {
        arg = undefined;
      });

      it('creates a LinkedFiles identity data structure', () => {
        expect(result).toEqual<LinkedFiles>({
          failed: [],
          ignored: [],
          linked: [],
        });
      });
    });

    describe('when called without some linked files', () => {
      beforeAll(() => {
        arg = {
          linked: [{ name: 'some-file.ts', type: FILE }],
        };
      });

      it('creates a LinkedFiles data structure', () => {
        expect(result).toEqual<LinkedFiles>({
          failed: [],
          ignored: [],
          linked: [{ name: 'some-file.ts', type: FILE }],
        });
      });
    });
  });

  describe('mergeLinkedFiles', () => {
    it('merges two linkedFile data structures', () => {
      const result = mergeLinkedFiles([
        linkedFilesFactory({ failed: [{ name: 'fileA.txt', type: FILE }] }),
        linkedFilesFactory({
          failed: [{ name: 'folder', type: DIR }],
          linked: [{ name: 'cheese', type: FILE }],
        }),
      ]);

      expect(result).toEqual<LinkedFiles>({
        failed: [
          { name: 'fileA.txt', type: FILE },
          { name: 'folder', type: DIR },
        ],
        ignored: [],
        linked: [{ name: 'cheese', type: FILE }],
      });
    });

    it("keeps duplicates because at this time that doesn't matter", () => {
      const result = mergeLinkedFiles([
        linkedFilesFactory({ failed: [{ name: 'fileA.txt', type: FILE }] }),
        linkedFilesFactory({ failed: [{ name: 'fileA.txt', type: FILE }] }),
      ]);

      expect(result).toEqual<LinkedFiles>({
        failed: [
          { name: 'fileA.txt', type: FILE },
          { name: 'fileA.txt', type: FILE },
        ],
        ignored: [],
        linked: [],
      });
    });
  });
});
