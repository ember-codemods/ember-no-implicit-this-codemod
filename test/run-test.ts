/* eslint-disable no-console */

// const versions = [process.env.EMBER_VERSION]
const allVersions = ['3.10', '3.13'];

import execa from 'execa';
import path from 'path';

import { log, error } from './helpers/utils';
import { TestRunner } from './helpers/test-runner';

async function runTestForVersion(version: string) {
  log(`Running Integration Test for Ember ${version}`);

  const runner = new TestRunner(version);

  await runner.installDeps();
  await runner.startEmber();
  await runner.runCodemod();
  await runner.stopEmber();
  await runner.compare();
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
    const fixturePath = path.join(process.cwd(), 'test', 'fixtures', emberVersion);
    await execa(`git checkout .`, { cwd: fixturePath });
  }

  process.exit(didSucceed ? 0 : 1);
})();
