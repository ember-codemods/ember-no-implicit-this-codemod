#!/usr/bin/env node
'use strict';

const debug = require('debug')('ember-no-implicit-this-codemod');
const {
  gatherTelemetryForUrl,
  analyzeEmberObject,
  getTelemetry,
} = require('ember-codemods-telemetry-helpers');
const appLocation = process.argv[2];
const args = process.argv.slice(3);

(async () => {
  debug('Gathering telemetry data from %s ...', appLocation);
  await gatherTelemetryForUrl(appLocation, analyzeEmberObject);

  let telemetry = getTelemetry();
  debug('Gathered telemetry on %d modules', Object.keys(telemetry).length);

  require('codemod-cli').runTransform(__dirname, 'no-implicit-this', args, 'hbs');
})();
