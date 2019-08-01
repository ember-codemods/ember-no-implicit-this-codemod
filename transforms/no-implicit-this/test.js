'use strict';

const path = require('path');
const { runTransformTest } = require('codemod-cli');
const { setTelemetry } = require('ember-codemods-telemetry-helpers');

const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');

let mockTelemetry = {};

Object.keys(mockTelemetryData).forEach(key => {
  let value = mockTelemetryData[key] || {};
  let mockPath = path.resolve(__dirname, `./__testfixtures__/${key}`);

  mockTelemetry[mockPath] = value;
});

setTelemetry(mockTelemetry);

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});
