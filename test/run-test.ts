/* eslint-disable no-console */

import { stripIndent } from 'common-tags';

import { error } from './helpers/utils';
import { runTestIntegrationSequence } from './helpers/sequence';

const allVersions = ['3.10', '3.13', '3.28'];

(async (): Promise<void> => {
  const emberVersion = process.env['EMBER_VERSION'];

  if (!emberVersion) {
    console.error(`No EMBER_VERSION set. No scenarios to run.`);
    process.exit(1);
  }

  if (!allVersions.includes(`${emberVersion}`)) {
    console.error(`EMBER_VERSION is not allowed. Available: ${allVersions.join(', ')}`);
    process.exit(1);
  }

  const mode = process.argv.includes('--runtime') ? 'runtime' : 'embroider';

  let didSucceed = false;

  try {
    process.env['DEBUG'] = 'true'; // hacks for now
    await runTestIntegrationSequence(emberVersion, mode);
    didSucceed = true;
  } catch (e) {
    error(e);

    didSucceed = false;
  } finally {
    // TODO: if there were any changes to the fixtures directories, revert them
    try {
      // const fixturePath = path.join(process.cwd(), 'test', 'fixtures', emberVersion);
      // await execa(`git checkout -- .`, { cwd: fixturePath });
    } catch (e) {
      error(stripIndent`
        There was a problem during cleanup.
        Do not commit any changes to the fixtures directory`);
      console.error(e);
    }
  }

  process.exit(didSucceed ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
