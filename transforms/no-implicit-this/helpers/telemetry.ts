import { getTelemetry as getRawTelemetry } from 'ember-codemods-telemetry-helpers';
import { z } from 'zod';

const RuntimeData = z.object({
  type: z.union([z.literal('Component'), z.literal('Helper')]),
});

export type RuntimeData = z.infer<typeof RuntimeData>;

export const Telemetry = z.record(RuntimeData);

export type Telemetry = z.infer<typeof Telemetry>;

/**
 * Gets telemetry data and parses it into a valid `Telemetry` object.
 */
export function getTelemetry(): Telemetry {
  let rawTelemetry = getRawTelemetry();
  if (!rawTelemetry) {
    // Do not re-throw. The most likely reason this happened was because
    // the user's app threw an error. We still want the codemod to work if so.
    // FIXME: debug log
    // logger.error({
    //   filePath,
    //   error: new RuntimeDataError('Could not find runtime data'),
    // });
    rawTelemetry = {};
  }

  const result = Telemetry.safeParse(rawTelemetry);
  if (result.success) {
    return result.data;
  } else {
    const { errors } = result.error;
    const messages = errors.map((error) => {
      return `[${error.path.join('.')}]: ${error.message}`;
    });
    throw new TelemetryError(`Could not parse telemetry: \n\t${messages.join('\n\t')}`);
  }
}

class TelemetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelemetryError';
  }
}
