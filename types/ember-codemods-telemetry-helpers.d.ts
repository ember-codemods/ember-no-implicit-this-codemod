declare module 'ember-codemods-telemetry-helpers' {
  export function getTelemetry(): unknown;
  export function getTelemetryFor(filePath: string): unknown;
  export function setTelemetry(telemetry: unknown): void;
  export function gatherTelemetryForUrl(url: string, gatherFn: () => unknown): Promise<unknown>;
  export function analyzeEmberObject(): unknown;
}
