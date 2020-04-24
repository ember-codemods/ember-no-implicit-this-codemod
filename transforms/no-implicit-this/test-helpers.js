const { setTelemetryWithKey } = require('ember-codemods-telemetry-helpers');
const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');
const { TELEMETRY_KEY } = require('./helpers/util');

function setupTelemetry() {
  setTelemetryWithKey(TELEMETRY_KEY, mockTelemetryData);
}

module.exports = { setupTelemetry };
