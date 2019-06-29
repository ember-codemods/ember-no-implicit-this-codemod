const path = require('path');

// const { getParser } = require('codemod-cli').jscodeshift;
const { parse: parseHbs, print: printHbs } = require('ember-template-recast');

const { determineThisUsage } = require('./helpers/determine-this-usage');

// const { getOptions } = require('codemod-cli');

module.exports = function transformer(file /*, api */) {
  let extension = path.extname(file.path);

  if (!['.hbs'].includes(extension.toLowerCase())) {
    // do nothing on non-hbs files
    return;
  }

  let root = parseHbs(file.source);

  let replaced = determineThisUsage(root, file);

  if (replaced) {
    return printHbs(replaced);
  }

  return file.source;
};
