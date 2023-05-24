export type Telemetry = Record<string, Record<string, unknown>>;

declare const telemetry: Telemetry;

export default telemetry;