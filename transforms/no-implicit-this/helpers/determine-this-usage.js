const path = require('path');
const recast = require('ember-template-recast');
const { getTelemetryFor } = require('./utils/get-telemetry-for');
const logger = require('./log-helper');
const transformPlugin = require('./plugin');

/**
 * Main entry point for parsing and inserting 'this' where appropriate
 *
 * @param {*} ast
 */
function determineThisUsage(ast, file) {
  let { path: filePath } = file;
  let runtimeData = getTelemetryFor(path.resolve(filePath));

  if (!runtimeData) {
    logger.warn(`[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`);
    return;
  }

  recast.transform(ast, env => transformPlugin(env, runtimeData));

  return ast;
}

module.exports = {
  determineThisUsage,
};
