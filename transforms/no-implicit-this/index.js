const path = require('path');
const fs = require('fs');

const debug = require('debug')('ember-no-implicit-this-codemod:transform');
const recast = require('ember-template-recast');
const { getTelemetry } = require('ember-codemods-telemetry-helpers');
const transform = require('./helpers/plugin');
const { TELEMETRY_KEY } = require('./helpers/util');
const { getOptions: getCLIOptions } = require('codemod-cli');
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
    prefixComponentPropertiesOnly: cliOptions.prefixComponentPropertiesOnly,
    customHelpers: _getCustomHelpersFromConfig(cliOptions.config),
    telemetry: getTelemetry(TELEMETRY_KEY),
  };
  return options;
}

module.exports = function transformer(file /*, api */) {
  let extension = path.extname(file.path);
  let options = Object.assign({}, DEFAULT_OPTIONS, getOptions(), { filePath: file.path });

  if (!['.hbs'].includes(extension.toLowerCase())) {
    debug('Skipping %s because it does not match the .hbs file extension', file.path);

    // do nothing on non-hbs files
    return;
  }

  debug('Parsing %s ...', file.path);
  let root = recast.parse(file.source);

  debug('Transforming %s ...', file.path);
  transform(root, options);

  debug('Generating new content for %s ...', file.path);
  return recast.print(root);
};
