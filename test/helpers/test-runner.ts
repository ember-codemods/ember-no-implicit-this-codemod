import execa, { CommonOptions } from 'execa';
import path from 'node:path';
import { kill, timeoutAfter } from './utils';
import { isRecord } from '../../helpers/types';

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

    if (process.env['DEBUG']) {
      emberServe.stdout?.pipe(process.stdout);
      emberServe.stderr?.pipe(process.stderr);
    }

    const serverWaiter = new Promise<void>(resolve => {
      emberServe.stdout?.on('data', data => {
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
    const { emberProcess } = this;
    if (emberProcess) {
      await timeoutAfter(devServerTimeout, kill(emberProcess));
    }
  }

  async compare() {
    try {
      const actual = path.join('app');
      const expectedApp = path.join('..', 'output', 'app');

      await execa('diff', ['-rq', actual, expectedApp], { cwd: this.inputDir, stdio: 'inherit' });
    } catch (e) {
      console.log(isRecord(e) ? e['stdout']: 'codemod did not run successfully');

      throw new Error('codemod did not run successfully');
    }
  }
}
