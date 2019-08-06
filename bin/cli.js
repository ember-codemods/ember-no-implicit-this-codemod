#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl } = require('ember-codemods-telemetry-helpers');

(async () => {
  await gatherTelemetryForUrl(process.argv[2]);

  require('codemod-cli').runTransform(
    __dirname,
    'no-implicit-this',
    process.argv.slice(2) /* paths or globs */
  );
})();
