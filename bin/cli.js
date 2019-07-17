#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl } = require('ember-codemods-telemetry-helpers');

(async () => {
  const appLocation = process.argv[2]
  await gatherTelemetryForUrl(appLocation);

  require('codemod-cli').runTransform(
    __dirname,
    'no-implicit-this',
    process.argv.slice(3), /* paths or globs */
    'hbs'
  );
})();
