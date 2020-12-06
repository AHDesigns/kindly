import { homedir } from 'os';
import { join } from 'path';
import { pathExists, writeFile, readFile } from 'fs-extra';
import { configLocation } from './constants';

const home = homedir();

const defaultConfig = {
  dotfilesLocation: join(home, 'PersonalConfigs'),
  dotfilesTarget: home,
};

export type Config = typeof defaultConfig;

export default async function getConfig(): Promise<Config> {
  if (!(await pathExists(configLocation))) {
    await writeFile(configLocation, JSON.stringify(defaultConfig, null, 2));
  }

  const maybeConfig = JSON.parse(
    await readFile(configLocation, { encoding: 'utf-8' }),
  ) as unknown;

  validate(maybeConfig);

  return maybeConfig;
}

function validate(maybeConfig: unknown): asserts maybeConfig is Config {
  if (typeof maybeConfig !== 'object' || maybeConfig === null)
    throw new Error('config not an object');

  const errs: string[] = Object.entries(defaultConfig)
    .map(([key, value]) => {
      if (!(key in maybeConfig)) return `key ${key} does not exist in config`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const val = (maybeConfig as any)[key] as unknown;
      if (typeof val !== typeof value)
        return `key ${key} does not have correct type: ${typeof value}; instead had ${typeof val}`;
      return null;
    })
    .filter<string>((x: string | null): x is string => x !== null);

  if (errs.length > 0) throw new Error(errs.join('\n'));
}
