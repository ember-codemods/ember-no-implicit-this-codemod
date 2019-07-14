#!/usr/bin/env node
'use strict';

const transformName = process.argv[2];
const args = process.argv.slice(3);

require('codemod-cli').runTransform(__dirname, transformName, args, 'hbs');
