import linkFilesInDirRecursively, {
  LinkDirection,
  LinkOptions,
} from './link-files';
import { LinkedFiles } from './linked-files';
import { pathExistsSync, readFileSync, lstatSync } from 'fs-extra';
import { join } from 'path';
import exec from '../utils/exec';

describe('LinkDotfiles', () => {
  let res: LinkedFiles;
  let from = 'tmp';
  let to = 'target';
  let options: LinkOptions = {};

  beforeEach(async () => {
    await copyFixturesToCleanTempFolder();
    await addFoldersAndFilesThatAlreadyExist();
    const linkDirection: LinkDirection = {
      from: join(process.cwd(), from),
      to: join(process.cwd(), to),
    };
    res = await linkFilesInDirRecursively(linkDirection, options)();
  });

  afterEach(async () => {
    await cleanupAllCreatedFiles();
  });

  const path = (pathLike: string): string => join(process.cwd(), to, pathLike);

  describe('when told to do a dry run', () => {
    beforeAll(() => {
      from = 'tmp';
      to = 'target';
      options = {
        dryRun: true,
      };
    });

    it('does not create any files or links', () => {
      expect(pathExistsSync(path('fileA.txt'))).toBe(false);
      expect(pathExistsSync(path('fileB.txt'))).toBe(false);
      expect(pathExistsSync(path('folderA/fileA'))).toBe(false);
    });

    it('populates the result', () => {
      expect(res.failed).toEqual(
        expect.arrayContaining([path('existsAlready.txt')]),
      );
      expect(res.linked).toEqual(
        expect.arrayContaining([
          path('fileA.txt'),
          path('fileB.txt'),
          path('folderA/fileA'),
        ]),
      );
      expect(res.ignored).toEqual(
        expect.arrayContaining([path('ignore-me.txt')]),
      );
    });
  });

  describe('when passed a target that matches ignore pattern', () => {
    beforeAll(() => {
      from = 'tmp';
      to = 'ignore';
      options = {
        dryRun: false,
      };
    });

    it('does not create it or symlink it', () => {
      expect(pathExistsSync(path(''))).toBe(false);
    });

    it('adds it to the ignored result', () => {
      const links = [path('')];
      expect(res.ignored).toStrictEqual(expect.arrayContaining(links));
    });
  });

  describe('for each file/folder in src', () => {
    beforeAll(() => {
      from = 'tmp';
      to = 'target';
      options = {
        dryRun: false,
      };
    });

    describe('when subject is a file', () => {
      describe('when file matches ignore pattern', () => {
        it('does not copy the file', () => {
          expect(pathExistsSync(path('ignore-me.txt'))).toBe(false);
          expect(pathExistsSync(path('ignore-me-as-well.txt'))).toBe(false);
        });

        it('adds the file to the ignored results', () => {
          const links = [path('ignore-me.txt'), path('ignore-me-as-well.txt')];
          expect(res.ignored).toStrictEqual(expect.arrayContaining(links));
        });
      });

      describe('when file does not exist in target', () => {
        it('symlinks file from src to dest', () => {
          expect(pathExistsSync(path('fileA.txt'))).toBe(true);
          expect(pathExistsSync(path('fileB.txt'))).toBe(true);
        });

        it('adds the file to linked results', () => {
          const links = [path('fileA.txt'), path('fileB.txt')];

          expect(res.linked).toStrictEqual(expect.arrayContaining(links));
        });
      });

      describe('when file exists in target', () => {
        it('does not link the file', () => {
          expect(
            readFileSync(path('existsAlready.txt'), { encoding: 'utf8' }),
          ).toBe('old file\n');
        });

        it('adds the file to failed results', () => {
          const links = [path('existsAlready.txt')];

          expect(res.failed).toStrictEqual(expect.arrayContaining(links));
        });
      });
    });

    describe('when subject is a symlink', () => {
      it('symlinks to the symlink inside the folder', () => {
        expect(lstatSync(path('symlink-toA')).isSymbolicLink()).toBe(true);
        expect(lstatSync(path('symlink-toFolderA')).isSymbolicLink()).toBe(
          true,
        );
      });

      it('adds the symlink to linked result', () => {
        const links = [path('symlink-toA'), path('symlink-toFolderA')];

        expect(res.linked).toStrictEqual(expect.arrayContaining(links));
      });
    });

    describe('when subject is a folder', () => {
      describe('when folder matches ignore pattern', () => {
        it('does not copy the folder', () => {
          expect(pathExistsSync(path('ignoreThisFolder'))).toBe(false);
        });

        it('does not copy any files inside the folder', () => {
          expect(pathExistsSync(path('ignoreThisFolder/fileA'))).toBe(false);
          expect(pathExistsSync(path('folderA/ignore-me.txt'))).toBe(false);
        });

        it('adds the folder to the ignored results', () => {
          const links = [path('ignoreThisFolder')];

          expect(res.ignored).toStrictEqual(expect.arrayContaining(links));
        });
      });

      describe('when the folder exists in target', () => {
        it('does not alter the folder', () => {
          expect(pathExistsSync(path('folderA/existsAlready.txt'))).toBe(true);
          expect(
            readFileSync(path('folderA/existsAlready.txt'), {
              encoding: 'utf8',
            }),
          ).toBe('old file\n');
        });

        it('symlinks the files inside the folder', () => {
          expect(pathExistsSync(path('folderA/fileA'))).toBe(true);
        });

        it('does not add the folder to the linked result', () => {
          const links = [path('folderA')];

          expect(res.failed).not.toStrictEqual(expect.arrayContaining(links));
          expect(res.linked).not.toStrictEqual(expect.arrayContaining(links));
        });
      });

      describe('when the folder does not exist in target', () => {
        it('symlinks the src folder to the target', () => {
          expect(lstatSync(path('folderB')).isSymbolicLink()).toBe(true);
          expect(pathExistsSync(path('folderB/fileA'))).toBe(true);
          expect(pathExistsSync(path('folderB/folderC/fileA'))).toBe(true);
        });

        it.todo('does not symlink any files inside the folder');
        it.todo('adds the folder to linked result');
        it.todo(
          'does not add any files inside the folder to the linked result',
        );
      });
    });
  });
});

async function copyFixturesToCleanTempFolder(): Promise<void> {
  await exec('rm -rf tmp');
  // -a copies everything as is, links, updated at, ect
  // -r recursive
  await exec('cp -ar fixtures/link-dotfiles tmp');
}

async function addFoldersAndFilesThatAlreadyExist(): Promise<void> {
  await exec('mkdir target');
  await exec('echo "old file" > target/existsAlready.txt ');

  await exec('mkdir target/folderA');
  await exec('echo "old file" > target/folderA/existsAlready.txt ');
}

async function cleanupAllCreatedFiles(): Promise<void> {
  await exec('rm -rf tmp');
  await exec('rm -rf target');
}
