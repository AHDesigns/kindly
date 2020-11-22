import { IConfig } from '@oclif/config';
import Hello from './hello';

describe('Hello command', () => {
  it('runs', async () => {
    const greeter = new Hello([], {} as IConfig);
    expect(await greeter.run()).toBeUndefined();
  });
});
