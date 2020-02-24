const { setTelemetry } = require('ember-codemods-telemetry-helpers');
const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');

function setupTelemetry() {
  setTelemetry(mockTelemetryData);
}

module.exports = { setupTelemetry };
