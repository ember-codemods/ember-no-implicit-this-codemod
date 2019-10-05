'use strict';

const { runTransformTest } = require('codemod-cli');
const { setupTelemetry } = require('./test-helpers');

setupTelemetry();

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});
