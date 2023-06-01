#!/usr/bin/env node
'use strict';

const { Runner } = require('../transforms/no-implicit-this/helpers/options');

const args = process.argv.slice(2);

Runner.withArgs(args)
  .run(__dirname, args)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
