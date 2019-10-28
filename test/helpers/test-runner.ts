import path from 'path';
import execa, { CommonOptions } from 'execa';
import { log, timeoutAfter, kill, error } from './utils';

const devServerTimeout = 60000;

export class TestRunner {
  version: string;
  inputDir: string;
  execOpts: CommonOptions<'utf8'>;

  private emberProcess?: execa.ExecaChildProcess;

  constructor(version: string) {
    this.version = version;

    // resolved from the root of the project
    const inputPath = path.join('test', 'fixtures', version, 'input');
    this.inputDir = path.resolve(inputPath);
    this.execOpts = { cwd: this.inputDir, stderr: 'inherit' };
  }

  async installDeps(): Promise<void> {
    await execa('rm', ['-rf', 'node_modules'], { cwd: this.inputDir });
    await execa('yarn', ['install'], { cwd: this.inputDir });
  }

  async runCodemod() {
    await execa('../../../../bin/cli.js', ['http://localhost:4200', 'app'], this.execOpts);
  }

  async startEmber(): Promise<void> {
    const emberServe = execa('yarn', ['ember', 'serve'], {
      cwd: this.inputDir,
      env: {
        JOBS: '1',
      },
    });

    if (process.env.DEBUG) {
      emberServe.stdout.pipe(process.stdout);
      emberServe.stderr.pipe(process.stderr);
    }

    const serverWaiter = new Promise(resolve => {
      emberServe.stdout.on('data', data => {
        if (data.toString().includes('Build successful')) {
          resolve();
        }
      });
    });

    try {
      await timeoutAfter(devServerTimeout, serverWaiter);
    } catch (e) {
      console.error(e);
      throw new Error('Ember server failed to start');
    }

    this.emberProcess = emberServe;
  }

  async stopEmber(): Promise<void> {
    await timeoutAfter(devServerTimeout, kill(this.emberProcess));
  }

  async compare() {
    try {
      const actual = path.join('app');
      const expectedApp = path.join('..', 'output', 'app');

      await execa('diff', ['-rq', actual, expectedApp], { cwd: this.inputDir, stdio: 'inherit' });
    } catch (e) {
      console.log(e.stdout);

      throw new Error('codemod did not run successfully');
    }
  }
}
