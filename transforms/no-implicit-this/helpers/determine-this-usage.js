const path = require('path');
const { getTelemetryFor, telemetry } = require('./utils/get-telemetry-for');
const logger = require('./log-helper');

const modulePaths = Object.keys(telemetry);
const moduleTelemetrys = Object.values(telemetry);
const componentTelemetry = moduleTelemetrys.filter(({ type }) => type === 'Component');
const helperTelemetry = moduleTelemetrys.filter(({ type }) => type === 'Helper');

const components = Object.keys(componentTelemetry);
const helpers = Object.keys(helperTelemetry);

/**
 * Main entry point for parsing and inserting 'this' where appropriate
 *
 * @param {*} ast
 */
function determineThisUsage(ast, file) {
  let { path: filePath } = file;
  let runtimeData = getTelemetryFor(path.resolve(filePath));

  console.log('getting runtime data for', filePath);
  if (!runtimeData) {
    logger.warn(`[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`);
    return;
  }

  debugger;

  return ast;
}

// Does the runtime data (for the current file)
// contain a definition for the token?
// - yes:
//   - in-let: false
//   - in-each: false
//   - true
// - no:
//   - is-helper: false
//   - is-component: false
function doesTokenNeedThis(token, runtimeData) {
  let { computedProperties, ownActions, ownProperties } = runtimeData;

  let isComputed = computedProperties.includes(token);
  let isAction = ownActions.includes(token);
  let isProperty = ownProperties.includes(token);

  let needsThis = isComputed || isAction || isProperty;

  if (needsThis) {
    return true;
  }

  // not found :(
  // search the world.
  let isComponent = components.includes(token);

  if (isComponent) {
    return false;
  }

  let isHelper = helpers.includes(token);

  if (isHelper) {
    return false;
  }

  // Hopefully local-scoped variable
  return false;
}

module.exports = {
  determineThisUsage,
};
