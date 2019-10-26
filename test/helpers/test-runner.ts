import path from 'path';
import execa, { CommonOptions } from 'execa';
import { log, timeoutAfter, kill, error } from './utils';

const devServerTimeout = 5000;

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
    log('installing deps');

    await execa('rm', ['-rf', 'node_modules'], this.execOpts);
    await execa('yarn', ['install'], this.execOpts);
  }

  async runCodemod() {
    log('running codemod');

    await execa('../../../../bin/cli.js', ['http://localhost:4200', 'app'], this.execOpts);

    log('codemod complete');
  }

  async startEmber(): Promise<void> {
    log('starting ember serve');

    const emberServe = execa('yarn', ['start'], { cwd: this.inputDir });

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
    log('killing the ember server');

    await timeoutAfter(devServerTimeout, kill(this.emberProcess));
  }

  async compare() {
    log('comparing results');

    try {
      const actual = path.join('app');
      const expectedApp = path.join('..', 'output', 'app');

      await execa('diff', ['-rq', actual, expectedApp], this.execOpts);
    } catch (e) {
      console.log(e.stdout);

      throw new Error('codemod did not run successfully');
    }

    log('codemod ran successfully! 🎉');
  }
}
