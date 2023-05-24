const HTMLBarsCompiler = require('ember-template-compiler');
const HTMLBarsInlinePrecompile = require('babel-plugin-htmlbars-inline-precompile');

module.exports = {
  plugins: [
    [
      HTMLBarsInlinePrecompile,
      {
        precompile: HTMLBarsCompiler.precompile,
      },
    ],
  ],
};
