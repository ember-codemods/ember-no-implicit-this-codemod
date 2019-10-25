#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');
const appLocation = process.argv[2];
const args = process.argv.slice(3);

(async () => {
  await gatherTelemetryForUrl(appLocation, analyzeEmberObject);

  require('codemod-cli').runTransform(__dirname, 'no-implicit-this', args, 'hbs');
})();
