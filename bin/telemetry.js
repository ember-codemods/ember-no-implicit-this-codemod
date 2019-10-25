#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

gatherTelemetryForUrl(process.argv[2], analyzeEmberObject);
