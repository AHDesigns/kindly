import { exec as execProcess } from 'child_process';

export default async function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execProcess(cmd, (error, stdout, stderr) => {
      if (error) {
        process.stderr.write(`exec error: ${error.message}`);
        process.stdout.write(`stdout: ${stdout}`);
        process.stderr.write(`stderr: ${stderr}`);
        reject();
      } else {
        resolve(stdout);
      }
    });
  });
}
