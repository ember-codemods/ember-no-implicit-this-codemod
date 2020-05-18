const debug = require('debug')('ember-no-implicit-this-codemod:plugin');
const recast = require('ember-template-recast');
const path = require('path');

// everything is copy-pasteable to astexplorer.net.
// sorta. telemetry needs to be defined.
// telemtry can be populated with -mock-telemetry.json
const KNOWN_HELPERS = require('./known-helpers');

function getTelemetryObjByName(name, telemetry) {
  let telemetryLookupName = Object.keys(telemetry).find(item => item.split(':').pop() === name);
  return telemetry[telemetryLookupName] || {};
}
/**
 * plugin entrypoint
 */
function transform(root, options = {}) {
  let b = recast.builders;

  let scopedParams = [];
  let telemetry = options.telemetry ? options.telemetry : {};

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
    if (node.this) {
      debug(`Skipping \`%s\` because it is already prefixed with \`this.\``, node.original);
      return;
    }

    // skip @foo
    if (node.data) {
      debug(`Skipping \`%s\` because it is already prefixed with \`@\``, node.original);
      return;
    }

    // skip {#foo as |bar|}}{{bar}}{{/foo}}
    // skip <Foo as |bar|>{{bar}}</Foo>
    let firstPart = node.parts[0];
    if (scopedParams.includes(firstPart)) {
      debug(`Skipping \`%s\` because it is a scoped variable`, node.original);
      return;
    }

    // check for the flag for stricter prefixing. This check ensures that it only
    // prefixes `this` to the properties owned by the backing JS class of the template.
    if (options.prefixComponentPropertiesOnly === 'true') {
      const matchedFilePath = Object.keys(telemetry).find(
        item => telemetry[item].filePath === path.relative(process.cwd(), options.filePath)
      );

      if (matchedFilePath) {
        let lookupObject = telemetry[matchedFilePath];
        const ownProperties = lookupObject ? lookupObject.localProperties : [];

        if (!ownProperties.includes(firstPart)) {
          debug(`Skipping \`%s\` because it is not a local property`, node.original);
          return;
        }
      }
    }

    // skip `hasBlock` keyword
    if (node.original === 'hasBlock') {
      debug(`Skipping \`%s\` because it is a keyword`, node.original);
      return;
    }

    // add `this.` prefix
    debug(`Transforming \`%s\` to \`this.%s\``, node.original, node.original);
    Object.assign(node, b.path(`this.${node.original}`));
  }

  function isHelper(name) {
    if (KNOWN_HELPERS.includes(name)) {
      debug(`Skipping \`%s\` because it is a known helper`, name);
      return true;
    }

    if (customHelpers.includes(name)) {
      debug(`Skipping \`%s\` because it is a custom configured helper`, name);
      return true;
    }

    const telemetryObj = getTelemetryObjByName(name, telemetry);
    if (telemetryObj.type === 'Helper') {
      let message = `Skipping \`%s\` because it appears to be a helper from the lookup object`;
      debug(message, name);
      return true;
    }

    return false;
  }

  function isComponent(name) {
    const telemetryObj = getTelemetryObjByName(name, telemetry);
    if (telemetryObj.type === 'Component') {
      let message = `Skipping \`%s\` because it appears to be a component from the lookup object`;
      debug(message, name);
      return true;
    }

    return false;
  }

  let inAttrNode = false;

  recast.traverse(root, {
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
        if (path.original.includes('$') || path.original.includes('::')) {
          let message = `Skipping \`%s\` because it looks like a helper/component invocation from ember-holy-futuristic-template-namespacing-batman`;
          debug(message, path.original);
          return;
        }

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
  });
}

module.exports = transform;
