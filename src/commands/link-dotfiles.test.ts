import { IConfig } from '@oclif/config';
import LinkDotfiles from './link-dotfiles';
import { pathExistsSync, readFileSync } from 'fs-extra';
import { join } from 'path';
import exec from '../utils/exec';

describe('LinkDotfiles', () => {
  beforeEach(async () => {
    await copyFixturesToCleanTempFolder();
    const greeter = new LinkDotfiles([], {} as IConfig);
    await greeter.run();
  });

  afterEach(async () => {
    await cleanupAllCreatedFiles();
  });

  const path = (pathLike: string): string =>
    join(process.cwd(), 'target', pathLike);

  describe('for each file/folder in src', () => {
    describe('when subject is a file', () => {
      describe('when file matches ignore pattern', () => {
        it('does not copy the file', () => {
          expect(pathExistsSync(path('ignore-me.txt'))).toBe(false);
          expect(pathExistsSync(path('ignore-me-as-well.txt'))).toBe(false);
        });
      });

      describe('when file does not exist in target', () => {
        it('symlinks file from src to dest', () => {
          expect(pathExistsSync(path('fileA.txt'))).toBe(true);
          expect(pathExistsSync(path('fileB.txt'))).toBe(true);
        });
      });

      describe('when file exists in target', () => {
        it('does not link the file', () => {
          expect(
            readFileSync(path('existsAlready.txt'), { encoding: 'utf8' }),
          ).toBe('old file\n');
        });

        it.todo('logs a warning');
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
      });

      describe('when the folder exists in target', () => {
        it.todo('does not alter the folder');
        it.todo('symlinks the files inside the folder');
      });

      describe('when the folder does not exist in target', () => {
        it('symlinks the src folder to the target', () => {
          expect(pathExistsSync(path('folderA/fileA'))).toBe(true);
          expect(pathExistsSync(path('folderB/fileA'))).toBe(true);
          expect(pathExistsSync(path('folderB/folderC/fileA'))).toBe(true);
        });
      });
    });
  });
});

async function copyFixturesToCleanTempFolder(): Promise<void> {
  await exec('rm -rf tmp');
  // -a copies everything as is, links, updated at, ect
  // -r recursive
  await exec('cp -ar fixtures/link-dotfiles tmp');

  await exec('mkdir target');
  await exec('echo "old file" > target/existsAlready.txt ');
}

async function cleanupAllCreatedFiles(): Promise<void> {
  await exec('rm -rf tmp');
  await exec('rm -rf target');
}
