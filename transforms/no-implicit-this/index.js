const path = require('path');

const { parse: parseHbs, print: printHbs } = require('ember-template-recast');
const { determineThisUsage } = require('./helpers/determine-this-usage');
const { getOptions } = require('codemod-cli');
const DEFAULT_OPTIONS = {
  dontAssumeThis: false,
};

module.exports = function transformer(file /*, api */) {
  let extension = path.extname(file.path);
  let options = Object.assign({}, DEFAULT_OPTIONS, getOptions());

  if (!['.hbs'].includes(extension.toLowerCase())) {
    // do nothing on non-hbs files
    return;
  }

  let root = parseHbs(file.source);

  let replaced = determineThisUsage(root, file, options);

  if (replaced) {
    return printHbs(replaced);
  }

  return file.source;
};
