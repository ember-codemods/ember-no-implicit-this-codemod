const path = require('path');
const globby = require('globby');
const TELEMETRY_KEY = 'telemetry-data';

/**
 * Generates a lookup name for a backing js class.
 * @param {*} matchedItem
 * @param {*} fileName
 * @param {*} type
 */
function getDetectedName(matchedItem, fileName, type) {
  let detectedName = null;
  // create regex string to derive the potential addon name and generated the
  // lookup name.
  let regexString = `(.*)/(addon|app)/${type}s(.*)/${fileName}.js`;
  let matchedRegex = matchedItem.match(regexString);
  if (matchedRegex) {
    const folderType = matchedRegex[2];
    const rootName = matchedRegex[1].split('/').pop();
    detectedName =
      folderType === 'addon' ? `${rootName}@${type}:${fileName}` : `${type}:${fileName}`;
  }
  return detectedName;
}

/**
 * Returns lookup name for a given file path (template file) by searching for a backing
 * js file for the template.
 * @param {*} entry
 */
function detectTypeAndName(entry) {
  let detectedComponentName = null;
  let detectedHelperName = null;
  let detectedControllerName = null;
  const fileName = path.basename(entry).split('.')[0];
  // Since we care about the component and helpers (as we do not want to prefix `this`) and
  // also we would need to generate lookupNames for controllers and components pertaining to the
  // current template file, do a globby search and gather filepaths that match these folders.
  const matched = globby.sync(
    [
      `**/components/**/${fileName}.js`,
      `**/helpers/**/${fileName}.js`,
      `**/controllers/**/${fileName}.js`,
    ],
    {
      ignore: ['**/node_modules/**'],
    }
  );
  if (matched.length) {
    matched.forEach(matchedItem => {
      detectedComponentName = getDetectedName(matchedItem, fileName, 'component');
      detectedHelperName = getDetectedName(matchedItem, fileName, 'helper');
      detectedControllerName = getDetectedName(matchedItem, fileName, 'controller');
    });
    let detectedName = detectedComponentName || detectedHelperName || detectedControllerName;
    return { lookupName: detectedName, filePath: entry };
  }
  return null;
}

/**
 * Analyzes the app and collects local properties and type of the lookup name.
 * Returns the map of lookupName to its metadata.
 * {
 *  "component:foo": { localProperties: ['foo', 'bar'], type: 'Component', filePath: 'app/components/foo.js' }
 * }
 * @param {*} lookupNames
 * @param {*} appname
 */
function appResolver(lookupNames, currAppName) {
  let mapping = {};
  if (Array.isArray(currAppName)) {
    currAppName.forEach(appItem => {
      try {
        let app = require(`${appItem}/app`).default.create({ autoboot: false });
        let localProperties = [];
        lookupNames.forEach(item => {
          // Resolve the class from the lookup name, if found, then check if its a helper, component
          // or controller and add the local properties & the type to the map.
          let klass = app.resolveRegistration(item.lookupName);
          if (klass) {
            if (klass.proto) {
              const protoInfo = klass.proto();
              localProperties = Object.keys(protoInfo).filter(
                key => !['_super', 'actions'].includes(key)
              );
              /* globals Ember */
              // Determine the type of the class's instance.
              let klassType = null;
              if (protoInfo instanceof Ember['Controller']) {
                klassType = 'Controller';
              } else if (protoInfo instanceof Ember['Component']) {
                klassType = 'Component';
              }

              // Create a map with lookupName as key with meta information.
              mapping[item.lookupName] = {
                filePath: item.filePath,
                localProperties,
                type: klassType,
              };
            } else if (klass.isHelperFactory) {
              mapping[item.lookupName] = { type: 'Helper', filePath: item.filePath };
            }
          }
        });
        app.destroy();
      } catch (e) {
        console.log(e);
      }
    });
  }

  return mapping;
}

module.exports = { appResolver, detectTypeAndName, TELEMETRY_KEY };
