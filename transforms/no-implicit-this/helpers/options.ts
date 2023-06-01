import { getOptions as getCodemodOptions, runTransform } from 'codemod-cli';
import Debug from 'debug';
import {
  analyzeEmberObject,
  gatherTelemetryForUrl,
  getTelemetry,
} from 'ember-codemods-telemetry-helpers';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import yargs from 'yargs';
import { ZodError, ZodType, z } from 'zod';
import { assert } from '../../../helpers/types';
import Resolver, { EmbroiderResolver, MockResolver, RuntimeResolver } from './resolver';

const debug = Debug('ember-no-implicit-this-codemod');

const DEFAULT_ROOT = 'app';
const DEFAULT_URL = 'http://localhost:4200';

export const Parser = yargs
  .option('root', {
    describe: 'app root FIXME',
    default: DEFAULT_ROOT,
    normalize: true,
  })
  .option('config', {
    describe: 'Path to config file FIXME',
    normalize: true,
  })
  .option('telemetry', {
    describe: 'Telemetry source FIXME',
    choices: ['auto', 'embroider', 'runtime'] as const,
    default: 'auto' as const,
  })
  .option('url', {
    describe: 'URL source FIXME',
    default: DEFAULT_URL,
  });

export function parseOptions(args: string[]): Options {
  return Parser.parseSync(args);
}

const Options = z.object({
  root: z.string().default(DEFAULT_ROOT),
  config: z.string().optional(),
  telemetry: z
    .union([z.literal('auto'), z.literal('embroider'), z.literal('runtime')])
    .default('auto'),
  url: z.string().url().default(DEFAULT_URL),
});

type Options = z.infer<typeof Options>;

const STAGE2_OUTPUT_FILE = 'dist/.stage2-output';

export interface DetectResult {
  isServerRunning: boolean;
  hasTelemetryOutput: boolean;
  hasStage2Output: boolean;
}

type MaybePromise<T> = T | Promise<T>;

export class Runner {
  static withArgs(args: string[]): Runner {
    return new Runner(parseOptions(args));
  }

  static withOptions(options: Partial<Options> = {}): Runner {
    return new Runner({
      root: 'app',
      config: undefined,
      telemetry: 'auto',
      url: 'http://localhost:4200',
      ...options,
    });
  }

  static fromCodemodOptions(): Runner {
    const options = parse(getCodemodOptions(), Options);
    return Runner.withOptions(options);
  }

  constructor(private readonly options: Options) {}

  async detectTelemetryType(
    detect: MaybePromise<DetectResult> = this.detect()
  ): Promise<'embroider' | 'runtime'> {
    const result = await detect;
    const type = this.options.telemetry;
    switch (type) {
      case 'embroider': {
        if (result.hasStage2Output) {
          return 'embroider';
        } else {
          throw new Error('Please run the thing first FIXME');
        }
      }

      case 'runtime': {
        if (result.hasStage2Output) {
          console.warn('Are you sure you want to use runtime telemetry? FIXME');
        }

        if (result.isServerRunning) {
          return 'runtime';
        } else {
          throw new Error('Please run the server or pass correct URL FIXME');
        }
      }

      case 'auto': {
        if (result.hasStage2Output) {
          return 'embroider';
        } else if (result.isServerRunning) {
          return 'runtime';
        } else {
          throw new Error('Please RTFM FIXME');
        }
      }
    }
  }

  async gatherTelemetry(): Promise<void> {
    const telemetryType = await this.detectTelemetryType();

    if (telemetryType === 'runtime') {
      debug('Gathering telemetry data from %s ...', this.options.url);
      await gatherTelemetryForUrl(this.options.url, analyzeEmberObject);

      const telemetry = getTelemetry() as Record<string, unknown>; // FIXME
      debug('Gathered telemetry on %d modules', Object.keys(telemetry).length);
    }
  }

  async run(root: string, args: string[]): Promise<void> {
    await this.gatherTelemetry();
    runTransform(root, 'no-implicit-this', [this.options.root, ...args], 'hbs');
  }

  buildResolver(): Resolver {
    const customHelpers = getCustomHelpersFromConfig(this.options.config);
    if (process.env['TESTING']) {
      return MockResolver.build(customHelpers);
    } else if (this.detectTelemetryTypeSync() === 'embroider') {
      return EmbroiderResolver.build(customHelpers);
    } else {
      return RuntimeResolver.build(customHelpers);
    }
  }

  private detectTelemetryTypeSync(): 'embroider' | 'runtime' {
    const result = this.detectSync();

    if (result.hasStage2Output) {
      return 'embroider';
    } else if (result.hasTelemetryOutput) {
      return 'runtime';
    } else {
      assert('gatherTelemetry must be called first');
    }
  }

  private async detect(): Promise<DetectResult> {
    const isServerRunning = await new Promise<boolean>((resolve) => {
      http.get(this.options.url, () => resolve(true)).on('error', () => resolve(false));
    });

    return { ...this.detectSync(), isServerRunning };
  }

  private detectSync(): DetectResult {
    const isServerRunning = false;
    const hasTelemetryOutput = Object.keys(getTelemetry() as Record<string, unknown>).length > 0;
    const hasStage2Output = fs.existsSync(STAGE2_OUTPUT_FILE);
    return { isServerRunning, hasTelemetryOutput, hasStage2Output };
  }
}

const FileOptions = z.object({
  helpers: z.array(z.string()),
});

type FileOptions = z.infer<typeof FileOptions>;

// FIXME: Document option
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

function makeConfigError(source: string, error: ZodError<ZodType>): ConfigError {
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
