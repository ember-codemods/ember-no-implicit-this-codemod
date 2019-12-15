import { TestRunner } from './test-runner';
import { log } from './utils';

export async function runTestIntegrationSequence(version: string) {
  const runner = new TestRunner(version);

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
}
