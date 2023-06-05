import Debug from 'debug';

const debug = Debug('ember-no-implicit-this-codemod:keywords');

// FIXME: Check keywords based on type. E.g. some can only be used in component vs helper position.
export function isKeyword(_type: 'component' | 'helper' | 'ambiguous', name: string): boolean {
  if (KNOWN_KEYWORDS.includes(name)) {
    debug(`Skipping \`%s\` because it is a known helper`, name);
    return true;
  } else {
    return false;
  }
}

const KNOWN_KEYWORDS = [
  // Ember.js
  'action',
  'array',
  'component',
  'concat',
  'debugger',
  'each',
  'each-in',
  'else',
  'fn',
  'get',
  'hash',
  'has-block',
  'has-block-params',
  'if',
  'if-unless',
  'in-element',
  '-in-element',
  'input',
  'textarea',
  'let',
  'link-to',
  'loc',
  'log',
  'mut',
  'on',
  'outlet',
  'partial',
  'query-params',
  'readonly',
  'unbound',
  'unless',
  'with',
  'yield',

  // Glimmer VM
  'identity', // glimmer blocks
  'render-inverse', // glimmer blocks
  '-get-dynamic-var', // glimmer internal helper
];
