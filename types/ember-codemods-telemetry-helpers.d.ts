declare module 'ember-codemods-telemetry-helpers' {
  export function getTelemetry(): unknown;
  export function getTelemetryFor(filePath: string): unknown;
  export function setTelemetry(telemetry: unknown): void;
  export function gatherTelemetryForUrl<T extends unknown[]>(
    url: string,
    gatherFn: (module: unknown, path: string, ...args: T) => unknown,
    ...args: T
  ): Promise<unknown>;
}
