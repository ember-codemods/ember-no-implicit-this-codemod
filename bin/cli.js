#!/usr/bin/env node
'use strict';

const debug = require('debug')('ember-no-implicit-this-codemod');
const {
  gatherTelemetryForUrl,
  analyzeEmberObject,
  getTelemetry,
} = require('ember-codemods-telemetry-helpers');

(async () => {
  let args = process.argv;

  // FIXME
  if (args.includes('--telemetry=runtime')) {
    const appLocation = args[2];

    debug('Gathering telemetry data from %s ...', appLocation);
    await gatherTelemetryForUrl(appLocation, analyzeEmberObject);

    let telemetry = getTelemetry();
    debug('Gathered telemetry on %d modules', Object.keys(telemetry).length);

    args = args.slice(3);
  } else {
    args = args.slice(2);
  }

  require('codemod-cli').runTransform(__dirname, 'no-implicit-this', args, 'hbs');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
