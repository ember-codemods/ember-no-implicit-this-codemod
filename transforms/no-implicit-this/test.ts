'use strict';

import { runTransformTest } from 'codemod-cli';
import { setupTelemetry } from './test-helpers';

setupTelemetry();

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});
