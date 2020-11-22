import { Command } from '@oclif/command';

export default class LinkDotfiles extends Command {
  static description =
    'link all files and folders from [src] to [target]. See "configure --help" for details on [src] and [target]';

  static examples = [`$ kindly link-dotfiles`];

  async run(): Promise<void> {
    this.log('Done');
  }
}
