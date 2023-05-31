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

  function isAmbiguous(
    node: AST.PathExpression
  ): node is AST.PathExpression & { head: AST.VarHead } {
    const { head } = node;

    // skip this.foo
    if (head.type === 'ThisHead') {
      debug(`Skipping \`%s\` because it is already prefixed with \`this.\``, node.original);
      return false;
    }

    // skip @foo
    if (head.type === 'AtHead') {
      debug(`Skipping \`%s\` because it is already prefixed with \`@\``, node.original);
      return false;
    }

    // FIXME: Why special-case this rather than handle it in keywords.ts?
    // skip `hasBlock` keyword
    if (node.original === 'hasBlock') {
      debug(`Skipping \`%s\` because it is a keyword`, node.original);
      return false;
    }

    // skip {#foo as |bar|}}{{bar}}{{/foo}}
    // skip <Foo as |bar|>{{bar}}</Foo>
    if (scopedParams.includes(head.name)) {
      debug(`Skipping \`%s\` because it is a scoped variable`, node.original);
      return false;
    }

    return true;
  }

  function handleParams(params: AST.Expression[]) {
    for (const param of params) {
      if (param.type === 'PathExpression' && isAmbiguous(param)) {
        handleThisFallback(param);
      }
    }
  }

  function handleHash(hash: AST.Hash) {
    for (const pair of hash.pairs) {
      if (pair.value.type === 'PathExpression' && isAmbiguous(pair.value)) {
        handleThisFallback(pair.value);
      }
    }
  }

  function handleThisFallback(node: AST.PathExpression) {
    // add `this.` prefix
    debug(`Transforming \`%s\` to \`this.%s\``, node.original, node.original);
    Object.assign(node, b.path(`this.${node.original}`));
  }

  function hasHelper(name: string) {
    // FIXME: Move to resolver
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

  function hasAmbiguous(name: string) {
    // FIXME: Move to resolver
    if (customHelpers.includes(name)) {
      debug(`Skipping \`%s\` because it is a custom configured helper`, name);
      return true;
    }

    if (resolver.has('ambiguous', name)) {
      const message = `Skipping \`%s\` because it appears to be a component or helper from the telemetry data: %s`;
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
        if (path.tail.length > 0 && isAmbiguous(path)) {
          handleThisFallback(path);
          return;
        }

        // skip ember-holy-futuristic-template-namespacing-batman component/helper invocations
        // (see https://github.com/rwjblue/ember-holy-futuristic-template-namespacing-batman)
        if (path.original.includes('$') || path.original.includes('::')) {
          const message = `Skipping \`%s\` because it looks like a helper/component invocation from ember-holy-futuristic-template-namespacing-batman`;
          debug(message, path.original);
          return;
        }

        if (isAmbiguous(path)) {
          if (inAttrNode && hasHelper(path.original)) {
            return;
          } else if (!inAttrNode && hasAmbiguous(path.original)) {
            return;
          }

          handleThisFallback(path);
        }
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
