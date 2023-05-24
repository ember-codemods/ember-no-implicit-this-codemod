const path = require('path');
const fs = require('fs');

const debug = require('debug')('ember-no-implicit-this-codemod:transform');
const recast = require('ember-template-recast');
const { getTelemetry } = require('ember-codemods-telemetry-helpers');
const transform = require('./helpers/plugin');
const { getOptions: getCLIOptions, jscodeshift } = require('codemod-cli');
const { isEmberTemplate } = require('./helpers/tagged-templates');
const DEFAULT_OPTIONS = {};

/**
 * Accepts the config path for custom helpers and returns the array of helpers
 * if the file path is resolved.
 * Context: This will allow the users to specify their custom list of helpers
 * along with the known helpers, this would give them more flexibility for handling
 * special usecases.
 * @param {string} configPath
 */
function _getCustomHelpersFromConfig(configPath) {
  let customHelpers = [];
  if (configPath) {
    let filePath = path.join(process.cwd(), configPath);
    let config = JSON.parse(fs.readFileSync(filePath));
    if (config.helpers) {
      customHelpers = config.helpers;
    }
  }
  return customHelpers;
}

/**
 * Returns custom options object to support the custom helpers config path passed
 * by the user.
 */
function getOptions() {
  let cliOptions = getCLIOptions();
  let options = {
    customHelpers: _getCustomHelpersFromConfig(cliOptions.config),
    telemetry: getTelemetry(),
  };
  return options;
}

/**
 * Given the location and source text of a template, as well as codemod options,
 * returns the rewritten template contents with `this` references inserted where
 * necessary.
 */
function rewriteTemplate(path, source, options) {
  debug('Parsing %s ...', path);
  let root = recast.parse(source);

  debug('Transforming %s ...', path);
  transform(root, options);

  debug('Generating new content for %s ...', path);
  return recast.print(root);
}

/**
 * Given a JS or TS file that potentially has embedded templates within it,
 * returns updated source with those templates rewritten to include `this`
 * references where needed.
 */
function rewriteEmbeddedTemplates(file, options, api) {
  return jscodeshift
    .getParser(api)(file.source)
    .find('TaggedTemplateExpression', { tag: { type: 'Identifier' } })
    .forEach(path => {
      if (isEmberTemplate(path)) {
        let { value } = path.node.quasi.quasis[0];
        value.raw = rewriteTemplate(file.path, value.raw, options);
      }
    })
    .toSource();
}

module.exports = function transformer(file, api) {
  let extension = path.extname(file.path).toLowerCase();
  let options = Object.assign({}, DEFAULT_OPTIONS, getOptions());
  if (extension === '.hbs') {
    return rewriteTemplate(file.path, file.source, options);
  } else if (extension === '.js' || extension === '.ts') {
    return rewriteEmbeddedTemplates(file, options, api);
  } else {
    debug('Skipping %s because it does not match a known extension with templates', file.path);
  }
};
