const path = require('path');
const { setTelemetry } = require('ember-codemods-telemetry-helpers');
const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');

function setupTelemetry() {
  let mockTelemetry = {};

  Object.keys(mockTelemetryData).forEach(key => {
    let value = mockTelemetryData[key] || {};
    let mockPath = path.resolve(__dirname, `./__testfixtures__/${key}`);

    mockTelemetry[mockPath] = value;
  });

  setTelemetry(mockTelemetry);
}

module.exports = { setupTelemetry };
