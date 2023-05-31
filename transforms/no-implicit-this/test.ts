'use strict';

import { runTransformTest } from 'codemod-cli';
import { setupResolver } from './test-helpers';

process.env['TESTING'] = 'true';

setupResolver();

runTransformTest({
  type: 'jscodeshift',
  name: 'no-implicit-this',
});
