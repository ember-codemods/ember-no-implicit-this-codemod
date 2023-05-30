import Debug from 'debug';
import { AST, builders as b, traverse } from 'ember-template-recast';
import { Options } from './options';

const debug = Debug('ember-no-implicit-this-codemod:plugin');

// everything is copy-pasteable to astexplorer.net.
// sorta. telemetry needs to be defined.
// telemetry can be populated with -mock-telemetry.json

/**
 * plugin entrypoint
 */
export default function transform(root: AST.Node, { customHelpers, resolver }: Options) {
  const scopedParams: string[] = [];

  const paramTracker = {
    enter(node: { blockParams: string[] }) {
      node.blockParams.forEach((param: string) => {
        scopedParams.push(param);
      });
    },

    exit(node: { blockParams: string[] }) {
      node.blockParams.forEach(() => {
        scopedParams.pop();
      });
    },
  };

  function handleParams(params: AST.Expression[]) {
    for (const param of params) {
      if (param.type !== 'PathExpression') continue;
      handlePathExpression(param);
    }
  }

  function handleHash(hash: AST.Hash) {
    for (const pair of hash.pairs) {
      if (pair.value.type !== 'PathExpression') continue;
      handlePathExpression(pair.value);
    }
  }

  function handlePathExpression(node: AST.PathExpression) {
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
    const firstPart = node.parts[0];
    if (firstPart && scopedParams.includes(firstPart)) {
      debug(`Skipping \`%s\` because it is a scoped variable`, node.original);
      return;
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

  function isHelper(name: string) {
    if (customHelpers.includes(name)) {
      debug(`Skipping \`%s\` because it is a custom configured helper`, name);
      return true;
    }

    if (resolver.has('helper', name)) {
      const message = `Skipping \`%s\` because it appears to be a helper from the telemetry data: %s`;
      debug(message, name);
      return true;
    }

    return false;
  }

  function isComponent(name: string) {
    if (resolver.has('component', name)) {
      const message = `Skipping \`%s\` because it appears to be a component from the telemetry data: %s`;
      debug(message, name);
      return true;
    }

    return false;
  }

  let inAttrNode = false;

  traverse(root, {
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
      const { path, params, hash } = node;

      // {{foo BAR}}
      handleParams(params);

      // {{foo bar=BAZ}}
      handleHash(hash);

      const hasParams = params.length !== 0;
      const hasHashPairs = hash.pairs.length !== 0;

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
          const message = `Skipping \`%s\` because it looks like a helper/component invocation from ember-holy-futuristic-template-namespacing-batman`;
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
