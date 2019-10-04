const path = require('path');
const recast = require('ember-template-recast');
const { getTelemetryFor } = require('ember-codemods-telemetry-helpers');

const logger = require('./log-helper');
const transformPlugin = require('./plugin');

/**
 * Main entry point for parsing and inserting 'this' where appropriate
 *
 * @param {*} ast
 */
function determineThisUsage(ast, file, options) {
  let { path: filePath } = file;
  let runtimeData = getTelemetryFor(path.resolve(filePath));

  if (!runtimeData) {
    let msg = `[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`;
    console.warn(msg);
    return;
  }

  recast.transform(ast, env => transformPlugin(env, runtimeData, options));

  return ast;
}

module.exports = {
  determineThisUsage,
};
