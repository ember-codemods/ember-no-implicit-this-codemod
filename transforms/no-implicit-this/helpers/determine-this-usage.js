const path = require('path');
const { getTelemetryFor } = require('./util/get-telemetry-for');
const logger = require('./log-helper');

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
}

module.exports = {
  determineThisUsage,
};
