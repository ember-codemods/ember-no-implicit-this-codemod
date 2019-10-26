import Listr from 'listr';

import { TestRunner } from './test-runner';
import { log } from './utils';

export async function runTestIntegrationSequence(version: string) {
  const runner = new TestRunner(version);

  if (process.env.DEBUG) {
    log(`Running Integration Test for Ember ${version}`);
    log(`Installing Dependencies`);
    await runner.installDeps();

    try {
      log(`Starting the Ember Dev Server`);
      await runner.startEmber();
      log(`Running Codemod`);
      await runner.runCodemod();
      log(`Stopping the Ember Dev Server`);
      await runner.stopEmber();
    } catch (e) {
      log(`Stopping the Ember Dev Server`);
      await runner.stopEmber();
      throw e;
    }

    log(`Comparing Results`);
    await runner.compare();

    return;
  }

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
