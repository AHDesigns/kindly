import { homedir } from 'os';
import { join } from 'path';

const home = homedir();

export const configLocation = join(home, '.config/kindly/kindly.json');
export const teardownLocation = join(home, '.config/kindly/teardown.json');
