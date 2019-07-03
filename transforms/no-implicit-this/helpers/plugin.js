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

  switch (root.type) {
    case "MustacheStatement":
      addThis(root.path, runtimeData);
      addThis(root.params, runtimeData);
      addThis(root.hash.pairs, runtimeData);

      return;
    case "ElementNode":
      addThis(root.attributes, runtimeData);
      addThis(root.children, runtimeData);
      return;
    case "AttrNode":
      addThis(root.value, runtimeData);
      return;
    case "PathExpression":
      let token = root.original;
      let isThisNeeded = doesTokenNeedThis(token, runtimeData);

      if (isThisNeeded) {
        root.original = `this.${token}`;
      }

      return;
    case "SubExpression":
      addThis(root.path, runtimeData);
      addThis(root.params, runtimeData);
      addThis(root.hash.pairs, runtimeData);

      return;
    case "BlockStatement":
      addThis(root.path, runtimeData);
      addThis(root.params, runtimeData);
      addThis(root.hash.pairs, runtimeData);
      addThis(root.program.body, runtimeData);
      return;
    case "HashPair":
      addThis(root.value, runtimeData);
    case "TextNode":
      return;
    default:
      console.log("unhandled", root.type);
  }
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
  let isComponent = components.find(path => path.endsWith(token));

  if (isComponent) {
    return false;
  }

  let isHelper = helpers.find(path => path.endsWith(token));

  if (isHelper) {
    return false;
  }

  // Hopefully local-scoped variable
  return false;
}

module.exports = transformPlugin;
