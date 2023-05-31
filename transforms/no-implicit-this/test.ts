'use strict';

import { describe, expect, test } from '@jest/globals';
import { runTransformTest } from 'codemod-cli';
import { setTelemetry } from 'ember-codemods-telemetry-helpers';
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

      const resolver = new EmbroiderResolver(new mockNodeResolver(), entryPoint);

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
