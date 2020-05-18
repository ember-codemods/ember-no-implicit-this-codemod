#!/usr/bin/env node
'use strict';

const debug = require('debug')('ember-no-implicit-this-codemod');
const globby = require('globby');
const finder = require('find-package-json');
const recast = require('ember-template-recast');
const fs = require('fs');
const path = require('path');
const {
  appResolver,
  detectTypeAndName,
  TELEMETRY_KEY,
} = require('../transforms/no-implicit-this/helpers/util');
const { gatherSingleTelemetryForUrl, getTelemetry } = require('ember-codemods-telemetry-helpers');
const appLocation = process.argv[2];
const args = process.argv.slice(3);

/**
 * Pre parse the template to collect information for potential helper/components
 * We are pushing the lookup names for any `PathExpression` occuring in:
 * - MustacheStatement: It could be helper or component
 * - BlockStatement: It can only be a component
 * - SubExpression: It can only be a helper
 * The values from this lookup array will be consumed by the app's resolver.
 * If the lookup name is is found in the app's registry, it would help
 * determine local properties for a given template's backing js class.
 * @param {*} root
 * @param {*} lookupNames
 */
function _preparseTemplate(root, filePath) {
  let lookupNames = [];
  recast.traverse(root, {
    MustacheStatement(node) {
      if (node.path.type === 'PathExpression') {
        lookupNames.push({ lookupName: `component:${node.path.original}`, filePath });
        lookupNames.push({ lookupName: `helper:${node.path.original}`, filePath });
      }
    },

    BlockStatement(node) {
      if (node.path.type === 'PathExpression') {
        lookupNames.push({ lookupName: `component:${node.path.original}`, filePath });
      }
    },

    SubExpression(node) {
      if (node.path.type === 'PathExpression') {
        lookupNames.push({ lookupName: `helper:${node.path.original}`, filePath });
      }
    },
  });
  return lookupNames;
}

/**
 * Return the app name based on the package json, keep calling the function
 * recursively until you reach the root of the app.
 * @param {*} f
 */
function findAppName(f) {
  let fileName = f.next().value;
  if (fileName.keywords && fileName.keywords.includes('ember-addon')) {
    return findAppName(f);
  } else if (Object.keys(fileName.devDependencies).includes('ember-cli')) {
    let emberAddon = fileName['ember-addon'];
    // There could be cases where the root package.json might have multiple Ember apps within.
    return emberAddon && emberAddon.apps ? emberAddon.apps : [fileName.name];
  }
}

(async () => {
  const filePaths = globby.sync(args[0], { ignore: 'node_modules/**' });

  // Get the package.json for the first file path and pass it to the `findAppName` function.
  // Note: We just need the first found file path since from there we would be able
  // to get the root level app name.
  const appName = filePaths ? findAppName(finder(filePaths[0])) : null;

  let lookupNames = filePaths.map(detectTypeAndName).filter(item => item !== null);
  // Pre-parse the each template file.
  for (let i = 0; i < filePaths.length; i++) {
    let filePath = filePaths[i];
    let extension = path.extname(filePath);

    if (!['.hbs'].includes(extension.toLowerCase())) {
      // do nothing on non-hbs files
      continue;
    }

    let code = fs.readFileSync(filePath).toString();
    let root = recast.parse(code);

    lookupNames = lookupNames.concat(_preparseTemplate(root, filePath));
  }

  debug('Gathering telemetry data from %s ...', appLocation);

  // This is for collecting metadata for the app just once to generate the map of lookupnames to local properties
  await gatherSingleTelemetryForUrl(
    appLocation,
    { telemetryKey: TELEMETRY_KEY },
    appResolver,
    lookupNames,
    appName
  );

  let telemetry = getTelemetry(TELEMETRY_KEY);

  debug('Gathered telemetry on %d modules', Object.keys(telemetry).length);

  require('codemod-cli').runTransform(__dirname, 'no-implicit-this', args, 'hbs');
})();
