const puppeteer = require('puppeteer');
const cache = require('./cache');

module.exports = async function gatherTelemetry(url) {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
  const page = await browser.newPage();

  await page.goto(url);

  await page.exposeFunction('logErrorInNodeProcess', message => {
    console.error(message); // eslint-disable-line no-console
  });

  const telemetry = await buildTelemetry(page);

  cache.set('telemetry', JSON.stringify(telemetry));

  await browser.close();
};

async function buildTelemetry(page) {
  // Get the "viewport" of the page, as reported by the page.
  const telemetry = await page.evaluate(evaluatePage);

  return telemetry;
}

function evaluatePage() {
  /**
   * Compares the object with types of Ember objects
   *
   * @param {Object} object
   * @returns {String} type
   */
  function getType(object) {
    const types = [
      'Application',
      'Controller',
      'Helper',
      'Route',
      'Component',
      'Service',
      'Router',
      'Engine',
    ];
    return types.find(type => Ember[type] && object instanceof Ember[type]) || 'EmberObject';
  }

  /**
   * Parses ember meta data object and collects the runtime information
   *
   * @param {Object} meta
   *
   * @returns {Object} data - Parsed metadata for the ember object
   * @returns {String[]} data.computedProperties - list of computed properties
   * @returns {String[]} data.observedProperties - list of observed properties
   * @returns {Object} data.observerProperties - list of observer properties
   * @returns {Object} data.offProperties - list of observer properties
   * @returns {String[]} data.overriddenActions - list of overridden actions
   * @returns {String[]} data.overriddenProperties - list of overridden properties
   * @returns {String[]} data.ownProperties - list of object's own properties
   * @returns {String} data.type - type of ember object
   * @returns {Object} data.unobservedProperties - list of unobserved properties
   */
  function parseMeta(meta = {}) {
    if (!meta || !meta.source) {
      return {};
    }
    const { source } = meta;
    const type = getType(source);

    const ownProperties = Object.keys(source).filter(key => !['_super', 'actions'].includes(key));

    const ownActions = source.actions ? Object.keys(source.actions) : [];

    const observedProperties = Object.keys(meta._watching || {});

    const computedProperties = [];
    meta.forEachDescriptors((name, desc) => {
      const descProto = Object.getPrototypeOf(desc) || {};
      const constructorName = descProto.constructor ? descProto.constructor.name : '';

      if (
        desc.enumerable &&
        ownProperties.includes(name) &&
        constructorName === 'ComputedProperty'
      ) {
        computedProperties.push(name);
      }
    });

    debugger;
    return {
      computedProperties,
      observedProperties,
      ownActions,
      ownProperties,
      type,
    };
  }

  debugger;
  const SKIPPED_MODULES = ['fetch/ajax'];

  /* globals window, Ember */
  let telemetry = {};

  const modules = Object.keys(window.require.entries);

  for (let modulePath of modules) {
    if (SKIPPED_MODULES.includes(modulePath)) {
      continue;
    }

    try {
      let module = require(modulePath);

      if (module && module.default && module.default.proto) {
        let defaultProto = module.default.proto();
        debugger;
        let meta = parseMeta(Ember.meta(defaultProto));

        debugger;
        telemetry[modulePath] = meta;
      }
    } catch (error) {
      // log the error, but continue
      window.logErrorInNodeProcess(`error evaluating \`${modulePath}\`: ${error.message}`);
    }
  }

  return telemetry;
}
