import { IConfig } from '@oclif/config';
import LinkDotfiles from './link-dotfiles';

describe('LinkDotfiles', () => {
  it('runs', async () => {
    const greeter = new LinkDotfiles([], {} as IConfig);
    expect(await greeter.run()).toBeUndefined();
  });
});
