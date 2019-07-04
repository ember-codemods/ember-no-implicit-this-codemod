'use strict';

const path = require('path');
const { runTransformTest } = require('codemod-cli');

const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');

const cache = require('../../lib/cache');

let mockTelemetry = {};

Object.keys(mockTelemetryData).forEach(key => {
  let value = mockTelemetryData[key] || {};
  let mockPath = path.resolve(__dirname, `./__testfixtures__/${key}`);

  mockTelemetry[mockPath] = value;
});

cache.set('telemetry', JSON.stringify(mockTelemetry));

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});
