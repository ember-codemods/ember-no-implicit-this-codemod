import chalk from 'chalk';
import execa from 'execa';
import { isRecord } from '../../helpers/types';

export function log(msg: unknown): void {
  console.log(chalk.yellowBright(msg));
}

export function error(msg: unknown): void {
  console.error(chalk.redBright(msg));
}

export function timeoutAfter<T>(ms: number, promise: Promise<T>) {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out after ${ms}ms`);
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

export async function kill(subprocess: execa.ExecaChildProcess): Promise<void> {
  if (!subprocess || !subprocess.pid) {
    throw new Error('Cannot kill non-running process');
  }

  try {
    console.log(`Requesting SIGTERM of ember serve: (PID) ${subprocess.pid}`);

    process.kill(subprocess.pid);
  } catch (e) {
    console.log(`PID ${subprocess.pid} has stopped.`);
    console.log(`\tKilled: ${subprocess.killed}`);
    console.log(`\tCancelled: ${isRecord(e) ? e['isCanceled']: 'unknown'}`);
  }

  return new Promise(resolve => {
    setTimeout(() => resolve(), 3000);
  });
}
