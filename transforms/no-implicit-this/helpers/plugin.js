// everything is copy-pasteable to astexplorer.net.
// sorta. telemetry needs to be defined.
// telemtry can be populated with -mock-telemetry.json
const KNOWN_HELPERS = require('./known-helpers');

/**
 * plugin entrypoint
 */
function transformPlugin(env, options = {}) {
  let { builders: b } = env.syntax;

  let scopedParams = [];
  let telemetry = options.telemetry || {};
  let [components, helpers] = populateInvokeables(telemetry);

  let customHelpers = options.customHelpers || [];

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

  function handleParams(params) {
    for (let param of params) {
      if (param.type !== 'PathExpression') continue;
      handlePathExpression(param);
    }
  }

  function handleHash(hash) {
    for (let pair of hash.pairs) {
      if (pair.value.type !== 'PathExpression') continue;
      handlePathExpression(pair.value);
    }
  }

  function handlePathExpression(node) {
    // skip this.foo
    if (node.this) return;

    // skip @foo
    if (node.data) return;

    // skip {#foo as |bar|}}{{bar}}{{/foo}}
    // skip <Foo as |bar|>{{bar}}</Foo>
    let firstPart = node.parts[0];
    if (scopedParams.includes(firstPart)) return;

    // skip `hasBlock` keyword
    if (node.original === 'hasBlock') return;

    // add `this.` prefix
    Object.assign(node, b.path(`this.${node.original}`));
  }

  function isHelper(name) {
    return (
      KNOWN_HELPERS.includes(name) ||
      customHelpers.includes(name) ||
      Boolean(helpers.find(path => path.endsWith(name)))
    );
  }

  function isComponent(name) {
    return Boolean(components.find(path => path.endsWith(name)));
  }

  let inAttrNode = false;

  return {
    Block: paramTracker,
    ElementNode: paramTracker,

    AttrNode: {
      enter() {
        inAttrNode = true;
      },
      exit() {
        inAttrNode = false;
      },
    },

    MustacheStatement(node) {
      let { path, params, hash } = node;

      // {{foo BAR}}
      handleParams(params);

      // {{foo bar=BAZ}}
      handleHash(hash);

      let hasParams = params.length !== 0;
      let hasHashPairs = hash.pairs.length !== 0;

      // {{FOO}}
      if (path.type === 'PathExpression' && !hasParams && !hasHashPairs) {
        // {{FOO.bar}}
        if (path.parts.length > 1) {
          handlePathExpression(path);
          return;
        }

        // skip ember-holy-futuristic-template-namespacing-batman component/helper invocations
        // (see https://github.com/rwjblue/ember-holy-futuristic-template-namespacing-batman)
        if (path.original.includes('$') || path.original.includes('::')) return;

        // skip helpers
        if (isHelper(path.original)) return;

        // skip components
        if (!inAttrNode && isComponent(path.original)) return;

        handlePathExpression(path);
      }
    },

    BlockStatement(node) {
      // {{#foo BAR}}{{/foo}}
      handleParams(node.params);

      // {{#foo bar=BAZ}}{{/foo}}
      handleHash(node.hash);
    },

    SubExpression(node) {
      // (foo BAR)
      handleParams(node.params);

      // (foo bar=BAZ)
      handleHash(node.hash);
    },

    ElementModifierStatement(node) {
      // <div {{foo BAR}} />
      handleParams(node.params);

      // <div {{foo bar=BAZ}} />
      handleHash(node.hash);
    },
  };
}

function populateInvokeables(telemetry) {
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

  return [components, helpers];
}

module.exports = transformPlugin;
