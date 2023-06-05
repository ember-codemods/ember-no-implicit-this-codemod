import { TestRunner } from './test-runner';
import { log } from './utils';

export async function runTestIntegrationSequence(
  version: string,
  mode: 'runtime' | 'embroider'
): Promise<void> {
  switch (mode) {
    case 'runtime':
      return runTestIntegrationSequenceWithRuntimeTelemetry(version);

    case 'embroider':
      return runTestIntegrationSequenceWithEmbroider(version);
  }
}

async function runTestIntegrationSequenceWithRuntimeTelemetry(version: string): Promise<void> {
  const runner = new TestRunner(version);

  log(`Running Integration Test for Ember ${version} Using Runtime Telemetry`);
  log(`Installing Dependencies`);
  await runner.installDeps();

  try {
    log(`Starting Ember Dev Server`);
    await runner.startEmber();
    log(`Running Codemod`);
    await runner.runCodemodRuntime();
    log(`Stopping Ember Dev Server`);
    await runner.stopEmber();
  } catch (e) {
    log(`Stopping Ember Dev Server`);
    await runner.stopEmber();
    throw e;
  }

  log(`Comparing Results`);
  await runner.compare();
  log(`Success`);
}

async function runTestIntegrationSequenceWithEmbroider(version: string): Promise<void> {
  const runner = new TestRunner(version);

  log(`Running Integration Test for Ember ${version} Using Embroider`);
  log(`Installing Dependencies`);
  await runner.installDeps();
  log(`Running Build`);
  await runner.runEmbroiderStage2Build();
  log(`Running Codemod`);
  await runner.runCodemodEmbroider();
  log(`Comparing Results`);
  await runner.compare();
  log(`Success`);
}
