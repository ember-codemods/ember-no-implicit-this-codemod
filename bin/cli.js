#!/usr/bin/env node
'use strict';

const Runner = require('../transforms/no-implicit-this/helpers/runner');

Runner.withArgs(process.argv.slice(2))
  .run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
