'use strict';

import { describe, expect, test } from '@jest/globals';
import { runTransformTest } from 'codemod-cli';
import { setTelemetry } from 'ember-codemods-telemetry-helpers';
import { RuntimeResolver } from './helpers/resolver';
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
});
