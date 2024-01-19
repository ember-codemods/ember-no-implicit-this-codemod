import { setTelemetry } from 'ember-codemods-telemetry-helpers';
import path from 'node:path';
import mockTelemetryData, { type Telemetry } from './__testfixtures__/-mock-telemetry.json';

export function setupTelemetry() {
  let mockTelemetry: Telemetry = {};

  Object.keys(mockTelemetryData).forEach(key => {
    let value = mockTelemetryData[key] || {};
    let mockPath = path.resolve(__dirname, `./__testfixtures__/${key}`);

    mockTelemetry[mockPath] = value;
  });

  setTelemetry(mockTelemetry);
}
