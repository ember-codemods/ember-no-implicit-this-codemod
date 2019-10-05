#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl } = require('ember-codemods-telemetry-helpers');

gatherTelemetryForUrl(process.argv[2]);
