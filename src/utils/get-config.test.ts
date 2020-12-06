import { mocked } from 'ts-jest/utils';
import getConfig, { Config } from './get-config';
import { writeFile, readFile } from 'fs-extra';
import { configLocation } from './constants';

jest.mock('os', () => ({
  homedir: () => '/home',
}));
jest.mock('fs-extra');

const mockedReadFile = mocked(readFile, true);

describe('getConfig', () => {
  let result: Config;

  beforeEach(async () => {
    result = await getConfig();
  });

  describe('when config file exists', () => {
    it.todo('reads config from config file');
  });

  describe('when config file does not exist', () => {
    const defaultConfig: Config = {
      dotfilesLocation: '/home/PersonalConfigs',
      dotfilesTarget: '/home',
    };

    beforeAll(() => {
      (readFile as Mock).mockResolvedValue(defaultConfig);
    });
    it('creates default config and returns it', () => {
      expect(writeFile).toHaveBeenCalledWith(
        configLocation,
        JSON.stringify(defaultConfig, null, 2),
      );

      expect(readFile).toHaveBeenCalledWith(configLocation, {
        encoding: 'utf-8',
      });

      expect(JSON.parse(result)).toEqual(defaultConfig);
    });
  });
});
