import { getOptions as getCLIOptions } from 'codemod-cli';
import fs from 'node:fs';
import path from 'node:path';
import { ZodError, ZodType, z } from 'zod';
import { Telemetry, getTelemetry } from './telemetry';

export interface Options {
  customHelpers: string[],
  telemetry: Telemetry
}

const CLIOptions = z.object({
  config: z.string().optional(),
});

type CLIOptions = z.infer<typeof CLIOptions>;

const FileOptions = z.object({
  helpers: z.array(z.string()),
});

type FileOptions = z.infer<typeof FileOptions>;

/**
 * Returns custom options object to support the custom helpers config path passed
 * by the user.
 */
export function getOptions(): Options {
  const cliOptions = parse(getCLIOptions(), CLIOptions);
  return {
    customHelpers: getCustomHelpersFromConfig(cliOptions.config),
    telemetry: getTelemetry(),
  };
}

// FIXME: Document
/**
 * Accepts the config path for custom helpers and returns the array of helpers
 * if the file path is resolved.
 * Context: This will allow the users to specify their custom list of helpers
 * along with the known helpers, this would give them more flexibility for handling
 * special use cases.
 */
function getCustomHelpersFromConfig(configPath: string | undefined): string[] {
  if (configPath) {
    const filePath = path.join(process.cwd(), configPath);
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
    const parsed = parse(config, FileOptions);
    if (parsed.helpers) {
      return parsed.helpers;
    }
  }
  return [];
}

function parse<Z extends ZodType>(raw: unknown, type: Z): z.infer<Z> {
  const parsed = type.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  } else {
    throw makeConfigError('cli', parsed.error);
  }
}

function makeConfigError(source: string, error: ZodError<CLIOptions>): ConfigError {
  const flattened = error.flatten();
  const errors = flattened.formErrors;
  for (const [key, value] of Object.entries(flattened.fieldErrors)) {
    errors.push(`[${key}] ${value.join('; ')}`);
  }
  const message = errors.join('\n\t');
  return new ConfigError(`${source} Config Error\n\t${message}`);
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}
