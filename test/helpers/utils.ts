import chalk from 'chalk';
import execa from 'execa';

export function log(msg: string): void {
  console.log(chalk.yellowBright(msg));
}

export function error(msg: string): void {
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

export async function kill(subprocess: execa.ExecaChildProcess) {
  if (!subprocess) {
    throw new Error('Cannot kill non-running process');
  }

  try {
    console.log(`Requesting SIGTERM of ember serve: (PID) ${subprocess.pid}`);

    process.kill(subprocess.pid);
  } catch (e) {
    console.log(`PID ${subprocess.pid} has stopped.`);
    console.log(`\tKilled: ${subprocess.killed}`);
    console.log(`\tCancelled: ${e.isCanceled}`);
  }

  return new Promise(resolve => {
    setTimeout(() => resolve(), 3000);
  });
}
