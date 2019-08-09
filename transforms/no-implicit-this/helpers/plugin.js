const { getTelemetry } = require('ember-codemods-telemetry-helpers');
// everything is copy-pasteable to astexplorer.net.
// sorta. telemetry needs to be defined.
// telemtry can be populated with -mock-telemetry.json
const ARGLESS_BUILTINS = [
  'debugger',
  'has-block',
  'hasBlock',
  'input',
  'outlet',
  'textarea',
  'yield',
];

/**
 * plugin entrypoint
 */
function transformPlugin(env, runtimeData, options) {
  let { builders: b } = env.syntax;

  let scopedParams = [];
  let [components, helpers] = populateInvokeables();

  let nonThises = { scopedParams, components, helpers };

  let paramTracker = {
    enter(node) {
      node.blockParams.forEach(param => {
        scopedParams.push(param);
      });
    },

    exit(node) {
      node.blockParams.forEach(() => {
        scopedParams.pop();
      });
    },
  };

  return {
    Program: paramTracker,
    ElementNode: paramTracker,
    PathExpression(ast) {
      let token = ast.parts[0];

      if (token !== 'this') {
        let isThisNeeded = doesTokenNeedThis(token, nonThises, runtimeData, options);

        if (isThisNeeded) {
          return b.path(`this.${ast.parts.join('.')}`);
        }
      }
    },
  };
}

// Does the runtime data (for the c
// urrent file)
// contain a definition for the token?
// - yes:
//   - in-let: false
//   - in-each: false
//   - true
// - no:
//   - is-helper: false
//   - is-component: false
function doesTokenNeedThis(
  token,
  { components, helpers, scopedParams },
  runtimeData,
  { dontAssumeThis }
) {
  if (ARGLESS_BUILTINS.includes(token)) {
    return false;
  }

  let isBlockParam = scopedParams.includes(token);

  if (isBlockParam) {
    return false;
  }

  let { computedProperties, getters, ownActions, ownProperties } = runtimeData;
  let isComputed = (computedProperties || []).includes(token);
  let isAction = (ownActions || []).includes(token);
  let isProperty = (ownProperties || []).includes(token);
  let isGetter = (getters || []).includes(token);

  let needsThis = isComputed || isAction || isProperty || isGetter;

  if (needsThis) {
    return true;
  }

  let isComponent = components.find(path => path.endsWith(token));

  if (isComponent) {
    return false;
  }

  let isHelper = helpers.find(path => path.endsWith(token));

  if (isHelper) {
    return false;
  }

  return dontAssumeThis ? false : true;
}

function populateInvokeables() {
  let components = [];
  let helpers = [];
  let telemetry = getTelemetry();

  for (let name of Object.keys(telemetry)) {
    let entry = telemetry[name];

    switch (entry.type) {
      case 'Component':
        components.push(name);
        break;
      case 'Helper':
        helpers.push(name);
        break;
    }
  }

  return [components, helpers];
}

module.exports = transformPlugin;
