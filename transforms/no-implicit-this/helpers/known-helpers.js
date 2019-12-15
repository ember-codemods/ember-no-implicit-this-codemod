const KNOWN_HELPERS = [
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
  'hasBlock',
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

module.exports = KNOWN_HELPERS;
