import { Command } from '@oclif/command';
// import { join } from 'path';
// import linkFilesInDirRecursively, { LinkDirection } from '../utils/link-files';

export default class LinkDotfiles extends Command {
  static description =
    'link all files and folders from [src] to [target]. See "configure --help" for details on [src] and [target]';

  static examples = [`$ kindly link-dotfiles`];

  async run(): Promise<void> {
    await Promise.resolve();
    // const linkDirection: LinkDirection = {
    //   from: join(process.cwd(), 'tmp'),
    //   to: join(process.cwd(), 'target'),
    // };
    // const res = await linkFilesInDirRecursively(linkDirection)();
    // this.log(JSON.stringify(res, null, 2));
    this.log('Done');
  }
}
