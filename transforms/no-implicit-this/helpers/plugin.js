const { telemetry } = require('./utils/get-telemetry-for');
// everything is copy-pasteable to astexplorer.net.
// sorta. telemetry needs to be defined.
// telemtry can be populated with -mock-telemetry.json
let components = [];
let helpers = [];

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

/**
 * plugin entrypoint
 */
function transformPlugin(env, runtimeData = {}) {
  return {
    Program(root) {
      addThis(root.body, runtimeData);
    },
  };
}

function addThis(root, runtimeData) {
  if (!root) {
    return;
  }

  let isArray = Array.isArray(root);
  if (isArray) {
    return root.forEach(node => addThis(node, runtimeData));
  }

  if (root.type === 'MustacheStatement') {
    if (root.path.type === 'PathExpression') {
      addThis(root.path, runtimeData);
      return addThis(root.params, runtimeData);
    }

    console.log('what do we do here?');

    return;
  } else if (root.type === 'ElementNode') {
    return root.children.forEach(node => addThis(node, runtimeData));
  } else if (root.type === 'PathExpression') {
    let token = root.original;
    let isThisNeeded = doesTokenNeedThis(token, runtimeData);

    if (isThisNeeded) {
      root.original = `this.${token}`;
    }

    return;
  }

  console.log('what now', root);
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
function doesTokenNeedThis(token, runtimeData) {
  let { computedProperties, ownActions, ownProperties } = runtimeData;

  let isComputed = (computedProperties || []).includes(token);
  let isAction = (ownActions || []).includes(token);
  let isProperty = (ownProperties || []).includes(token);

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

module.exports = transformPlugin;
