import { IConfig } from '@oclif/config';
import LinkDotfiles from './link-dotfiles';
import exec from '../utils/exec';

describe('LinkDotfiles', () => {
  beforeAll(async () => {
    await copyFixturesToCleanTempFolder();
  });

  afterAll(async () => {
    await cleanupAllCreatedFiles();
  });

  beforeEach(async () => {
    const greeter = new LinkDotfiles([], {} as IConfig);
    await greeter.run();
  });

  describe('for each file/folder in src', () => {
    describe('when subject is a file', () => {
      it.todo('symlinks file from src to dest');

      describe('when file matches ignore pattern', () => {
        it.todo('does not copy the file');
      });
    });

    describe('when subject is a folder', () => {
      describe('when folder matches ignore pattern', () => {
        it.todo('does not copy the folder');
        it.todo('does not copy any files inside the folder');
      });

      describe('when the folder exists in target', () => {
        it.todo('does not copy the folder');
        it.todo('symlinks the files inside the folder');
      });

      describe('when the folder does not exist in target', () => {
        it.todo('symlinks the src folder to the target');
      });
    });
  });
});

async function copyFixturesToCleanTempFolder(): Promise<void> {
  await exec('rm -rf tmp');
  // -a copies everything as is, links updated at ect
  // -r recursive
  await exec('cp -ar fixtures/link-dotfiles tmp');
}

async function cleanupAllCreatedFiles(): Promise<void> {
  await exec('rm -rf tmp');
}
