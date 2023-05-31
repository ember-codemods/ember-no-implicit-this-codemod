import { runTransform } from 'codemod-cli';
import Debug from 'debug';
import {
  analyzeEmberObject,
  gatherTelemetryForUrl,
  getTelemetry,
} from 'ember-codemods-telemetry-helpers';
import fs from 'node:fs';
import http from 'node:http';
import yargs from 'yargs';
import { assert, isRecord } from '../../../helpers/types';

const debug = Debug('ember-no-implicit-this-codemod');

export interface Options {
  config: string | undefined;
  telemetry: 'auto' | 'embroider' | 'runtime';
  url: string;
}

export const Parser = yargs
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
    default: 'http://localhost:4200',
  });

export function parseOptions(args: string[]): Options {
  return Parser.parseSync(args);
}

export function validateOptions(options: unknown): asserts options is Options {
  assert('options must be an object', isRecord(options));

  const { config, telemetry, url } = options;

  assert('config must be a string', config === undefined || typeof config === 'string');
  assert(
    'telemetry must be one of auto, embroider, or runtime',
    typeof telemetry === 'string' && ['auto', 'embroider', 'runtime'].includes(telemetry)
  );
  assert('url must be a string', typeof url === 'string');
}

export interface DetectResult {
  isServerRunning: boolean;
  hasStage2Output: boolean;
}

type MaybePromise<T> = T | Promise<T>;

export default class Runner {
  static withArgs(args: string[]): Runner {
    return new Runner(parseOptions(args));
  }

  static withOptions(options: Partial<Options> = {}): Runner {
    return new Runner({
      config: undefined,
      telemetry: 'auto',
      url: 'http://localhost:4200',
      ...options,
    });
  }

  constructor(private readonly options: Options) {
    validateOptions(options);
  }

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

  async run(): Promise<void> {
    const telemetryType = await this.detectTelemetryType();

    if (telemetryType === 'runtime') {
      debug('Gathering telemetry data from %s ...', this.options.url);
      await gatherTelemetryForUrl(this.options.url, analyzeEmberObject);

      const telemetry = getTelemetry() as Record<string, unknown>; // FIXME
      debug('Gathered telemetry on %d modules', Object.keys(telemetry).length);
    }

    runTransform(__dirname, 'no-implicit-this', process.argv, 'hbs');
  }

  private async detect(): Promise<DetectResult> {
    const isServerRunning = await new Promise<boolean>((resolve) => {
      http.get(this.options.url, () => resolve(true)).on('error', () => resolve(false));
    });

    const hasStage2Output = fs.existsSync('dist/.stage2-output');

    return { isServerRunning, hasStage2Output };
  }
}
