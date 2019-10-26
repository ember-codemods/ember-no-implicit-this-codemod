/* eslint-disable no-console */

// const versions = [process.env.EMBER_VERSION]
const allVersions = ['3.10', '3.13'];

const execa = require('execa');
const path = require('path');

async function kill(subprocess) {
  setTimeout(() => {
    subprocess.cancel();
    subprocess.kill('SIGTERM');
  }, 1000);

  console.log(`Requesting SIGTERM of ${subprocess.pid}`);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function runTestForVersion(version) {
  console.log(`
    Running Integration Test for Ember ${version}
  `);

  // resolved from the root of the project
  const inputDir = path.resolve(`./test/fixtures/${version}/input`);
  const execOpts = { cwd: inputDir, stderr: 'inherit' };

  console.log('installing deps');

  await execa('rm', ['-rf', 'node_modules'], execOpts);
  await execa('yarn', ['install'], execOpts);

  console.log('starting serve');

  // We use spawn for this one so we can kill it later without throwing an error
  const emberServe = execa('yarn', ['start'], { cwd: inputDir });
  let emberHasLoaded = false;

  emberServe.stdout.pipe(process.stdout);
  emberServe.stderr.pipe(process.stderr);
  let serverWaiter = new Promise(resolve => {
    emberServe.stdout.on('data', data => {
      if (data.toString().includes('Build successful')) {
        emberHasLoaded = true;
        resolve();
      }
    });
  });

  try {
    console.log('eh');
    await serverWaiter;
    console.log('eh2');
  } catch (e) {
    console.error('Ember server failed to start');
    console.log(e.stdout);
  }

  if (!emberHasLoaded) {
    throw new Error('Ember server never started :(');
  }

  console.log('running codemod');

  await execa('../../../../bin/cli.js', ['http://localhost:4200', 'app'], execOpts);

  console.log('codemod complete, ending serve');

  await kill(emberServe);

  console.log('comparing results');

  try {
    await execa('diff', ['-rq', './app', '../output/app'], execOpts);
  } catch (e) {
    console.error('codemod did not run successfully');
    console.log(e.stdout);

    process.exit(1);
  }

  console.log('codemod ran successfully! 🎉');
}

(async () => {
  let emberVersion = process.env.EMBER_VERSION;
  if (!emberVersion) {
    console.error(`No EMBER_VERSION set. No scenarios to run.`);
    process.exit(1);
  }

  if (!allVersions.includes(`${emberVersion}`)) {
    console.error(`EMBER_VERSION is not allowed. Available: ${allVersions.join(', ')}`);
    process.exit(1);
  }

  await runTestForVersion(emberVersion);

  process.exit(0);
})();
