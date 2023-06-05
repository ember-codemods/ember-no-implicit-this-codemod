'use strict';

import { describe, expect, test } from '@jest/globals';
import { runTransformTest } from 'codemod-cli';
import { setTelemetry } from 'ember-codemods-telemetry-helpers';
import { DetectResult, Parser, Runner } from './helpers/options';
import {
  EmbroiderResolver,
  HasNodeResolve,
  NodeResolution,
  RuntimeResolver,
} from './helpers/resolver';
import { setupResolver } from './test-helpers';

process.env['TESTING'] = 'true';

setupResolver();

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});

describe('Resolver', () => {
  describe('RuntimeResolver', () => {
    test('.has', () => {
      const telemetry = {
        'pyckle/components/gherkyn': {
          type: 'Component',
          computedProperties: [],
          offProperties: {},
          overriddenActions: [],
          overriddenProperties: [],
          unobservedProperties: {},
        },
        'pyckle/helpers/cucumbyr': {
          type: 'Helper',
          computedProperties: [],
          offProperties: {},
          overriddenActions: [],
          overriddenProperties: [],
          unobservedProperties: {},
        },
        'ember-welcome-page/templates/components/welcome-page': {
          type: 'Component',
          computedProperties: [],
          offProperties: {},
          overriddenActions: [],
          overriddenProperties: [],
          unobservedProperties: {},
        },
      };
      setTelemetry(telemetry);
      const resolver = RuntimeResolver.build();

      expect(resolver.has('component', 'gherkyn')).toBe(true);
      expect(resolver.has('component', 'welcome-page')).toBe(true);
      expect(resolver.has('component', 'cucumbyr')).toBe(false);
      expect(resolver.has('component', 'nope')).toBe(false);

      expect(resolver.has('helper', 'gherkyn')).toBe(false);
      expect(resolver.has('helper', 'welcome-page')).toBe(false);
      expect(resolver.has('helper', 'cucumbyr')).toBe(true);
      expect(resolver.has('helper', 'nope')).toBe(false);

      expect(resolver.has('ambiguous', 'gherkyn')).toBe(true);
      expect(resolver.has('ambiguous', 'welcome-page')).toBe(true);
      expect(resolver.has('ambiguous', 'cucumbyr')).toBe(true);
      expect(resolver.has('ambiguous', 'nope')).toBe(false);
    });
  });

  describe('EmbroiderResolver', () => {
    test('.has', () => {
      const entryPoint = 'foo';
      class mockNodeResolver implements HasNodeResolve {
        nodeResolve(specifier: string, fromFile: string): NodeResolution {
          expect(fromFile).toEqual(entryPoint);
          const resolution = {
            '#embroider_compat/components/gherkyn': 'real' as const,
            '#embroider_compat/ambiguous/gherkyn': 'real' as const,
            '#embroider_compat/components/welcome-page': 'real' as const,
            '#embroider_compat/ambiguous/welcome-page': 'real' as const,
            '#embroider_compat/helpers/cucumbyr': 'real' as const,
            '#embroider_compat/ambiguous/cucumbyr': 'real' as const,
            '#embroider_compat/ambiguous/virtual': 'virtual' as const,
          }[specifier];
          return { type: resolution ?? 'not_found' };
        }
      }

      const resolver = new EmbroiderResolver([], new mockNodeResolver(), entryPoint);

      expect(resolver.has('component', 'gherkyn')).toBe(true);
      expect(resolver.has('component', 'welcome-page')).toBe(true);
      expect(resolver.has('component', 'cucumbyr')).toBe(false);
      expect(resolver.has('component', 'nope')).toBe(false);

      expect(resolver.has('helper', 'gherkyn')).toBe(false);
      expect(resolver.has('helper', 'welcome-page')).toBe(false);
      expect(resolver.has('helper', 'cucumbyr')).toBe(true);
      expect(resolver.has('helper', 'nope')).toBe(false);

      expect(resolver.has('ambiguous', 'gherkyn')).toBe(true);
      expect(resolver.has('ambiguous', 'welcome-page')).toBe(true);
      expect(resolver.has('ambiguous', 'cucumbyr')).toBe(true);
      expect(resolver.has('ambiguous', 'nope')).toBe(false);
      expect(resolver.has('ambiguous', 'virtual')).toBe(true);
    });
  });
});

describe('Parser', () => {
  test('args parsing', () => {
    const parse = (...args: string[]) => Parser.exitProcess(false).parseSync(args);

    expect(parse().config).toEqual(undefined);
    expect(parse('--config=config.json').config).toEqual('config.json');
    expect(parse('--config', 'config.json').config).toEqual('config.json');

    expect(parse().telemetry).toEqual('auto');
    expect(parse('--telemetry=auto').telemetry).toEqual('auto');
    expect(parse('--telemetry', 'auto').telemetry).toEqual('auto');
    expect(parse('--telemetry=embroider').telemetry).toEqual('embroider');
    expect(parse('--telemetry', 'embroider').telemetry).toEqual('embroider');
    expect(parse('--telemetry=runtime').telemetry).toEqual('runtime');
    expect(parse('--telemetry', 'runtime').telemetry).toEqual('runtime');
    expect(() => parse('--telemetry', 'zomg')).toThrow('zomg');

    expect(parse().url).toEqual('http://localhost:4200');
    expect(parse('--url=http://zomg.localhost:8888').url).toEqual('http://zomg.localhost:8888');
    expect(parse('--url', 'http://zomg.localhost:8888').url).toEqual('http://zomg.localhost:8888');
  });
});

describe('Runner', () => {
  test('telemetry detection', async () => {
    let runner: Runner;

    const detect = async (result: Omit<DetectResult, 'hasTelemetryOutput'>) =>
      runner.detectTelemetryType({ ...result, hasTelemetryOutput: false });

    const expectRuntime = async (result: Omit<DetectResult, 'hasTelemetryOutput'>) =>
      expect(detect(result)).resolves.toEqual('runtime');

    const expectEmbroider = async (result: Omit<DetectResult, 'hasTelemetryOutput'>) =>
      expect(detect(result)).resolves.toEqual('embroider');

    const expectError = async (result: Omit<DetectResult, 'hasTelemetryOutput'>, message: string) =>
      expect(detect(result)).rejects.toThrow(message);

    runner = Runner.withOptions({ telemetry: 'auto' });
    await expectEmbroider({ isServerRunning: false, hasStage2Output: true });
    await expectEmbroider({ isServerRunning: true, hasStage2Output: true });
    await expectRuntime({ isServerRunning: true, hasStage2Output: false });
    await expectError({ isServerRunning: false, hasStage2Output: false }, 'Please RTFM FIXME');

    runner = Runner.withOptions({ telemetry: 'embroider' });
    await expectEmbroider({ isServerRunning: false, hasStage2Output: true });
    await expectEmbroider({ isServerRunning: true, hasStage2Output: true });
    await expectError(
      { isServerRunning: true, hasStage2Output: false },
      'Please run the thing first FIXME'
    );
    await expectError(
      { isServerRunning: false, hasStage2Output: false },
      'Please run the thing first FIXME'
    );

    runner = Runner.withOptions({ telemetry: 'runtime' });
    await expectError(
      { isServerRunning: false, hasStage2Output: true },
      'Please run the server or pass correct URL FIXME'
    );
    await expectRuntime({ isServerRunning: true, hasStage2Output: true });
    await expectRuntime({ isServerRunning: true, hasStage2Output: false });
    await expectError(
      { isServerRunning: false, hasStage2Output: false },
      'Please run the server or pass correct URL FIXME'
    );
  });
});
