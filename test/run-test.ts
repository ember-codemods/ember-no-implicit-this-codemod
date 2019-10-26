/* eslint-disable no-console */

// const versions = [process.env.EMBER_VERSION]
const allVersions = ['3.10', '3.13'];

import path from 'path';
import execa from 'execa';
import Listr from 'listr';

import { log, error } from './helpers/utils';
import { TestRunner } from './helpers/test-runner';

async function runTestForVersion(version: string) {
  log(`Running Integration Test for Ember ${version}`);

  const runner = new TestRunner(version);

  const tasks = new Listr([
    {
      title: `Running Integration Test for Ember ${version}`,
      task: () => {
        return new Listr([
          {
            title: 'Installing Dependencies',
            task: runner.installDeps,
          },
          {
            title: 'Starting the Ember Dev Server',
            task: runner.startEmber,
          },
          {
            title: 'Run Codemods',
            task: runner.runCodemod,
          },
          {
            title: 'Stopping the Ember Dev Server',
            task: runner.stopEmber,
          },
          {
            title: 'Comparing Results',
            task: runner.compare,
          },
        ]).run();
      },
    },
  ]);

  await tasks.run();
}

(async () => {
  const emberVersion = process.env.EMBER_VERSION;

  if (!emberVersion) {
    console.error(`No EMBER_VERSION set. No scenarios to run.`);
    process.exit(1);
  }

  if (!allVersions.includes(`${emberVersion}`)) {
    console.error(`EMBER_VERSION is not allowed. Available: ${allVersions.join(', ')}`);
    process.exit(1);
  }

  let didSucceed = false;

  try {
    await runTestForVersion(emberVersion);
    didSucceed = true;
  } catch (e) {
    error(e);

    didSucceed = false;
  } finally {
    // TOOD: if there were any changes to the fixtures directories, revert them
    try {
      const fixturePath = path.join(process.cwd(), 'test', 'fixtures', emberVersion);
      await execa(`git checkout -- .`, { cwd: fixturePath });
    } catch (e) {
      error('There was a problem during cleanup. Do not commit the fixtures directory');
    }
  }

  process.exit(didSucceed ? 0 : 1);
})();
