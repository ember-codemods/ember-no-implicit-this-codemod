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
    MustacheStatement(root) {
      transformPlugin(root.path, runtimeData);
      transformPlugin(root.params, runtimeData);
      transformPlugin(root.hash.pairs, runtimeData);
    },
    ElementNode(root) {
      transformPlugin(root.attributes, runtimeData);
      transformPlugin(root.children, runtimeData);
    },
    AttrNode(root) {
      transformPlugin(root.value, runtimeData);
    },
    PathExpression(root) {
      let token = root.original;
      let isThisNeeded = doesTokenNeedThis(token, runtimeData);

      if (isThisNeeded) {
        root.original = `this.${token}`;
        //root.this = true;
        //root.loc.start.column += 5;
      }
    },
    SubExpression(root) {
      transformPlugin(root.path, runtimeData);
      transformPlugin(root.params, runtimeData);
      transformPlugin(root.hash.pairs, runtimeData);
    },
    BlockStatement(root) {
      transformPlugin(root.path, runtimeData);
      transformPlugin(root.params, runtimeData);
      transformPlugin(root.hash.pairs, runtimeData);
      transformPlugin(root.program.body, runtimeData);
    },
    HashPair(root) {
      transformPlugin(root.value, runtimeData);
    }
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
