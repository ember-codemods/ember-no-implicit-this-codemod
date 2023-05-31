// FIXME: Make these optional dependencies
import { Telemetry, getTelemetry } from './telemetry';
import { Resolver as _EmbroiderResolver } from '@embroider/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isKeyword } from './keywords';

export default abstract class Resolver {
  has(type: 'component' | 'helper' | 'ambiguous', name: string): boolean {
    if (isKeyword(type, name)) {
      return true;
    }
    switch (type) {
      case 'component':
        return this.hasComponent(name);
      case 'helper':
        return this.hasHelper(name);
      case 'ambiguous':
        return this.hasAmbiguous(name);
    }
  }

  protected abstract hasComponent(name: string): boolean;
  protected abstract hasHelper(name: string): boolean;

  protected hasAmbiguous(name: string): boolean {
    return this.hasComponent(name) || this.hasHelper(name);
  }
}

export class RuntimeResolver extends Resolver {
  static build(): RuntimeResolver {
    const telemetry = getTelemetry();
    const [components, helpers] = populateInvokeables(telemetry);
    return new RuntimeResolver(components, helpers);
  }

  constructor(private components: string[], private helpers: string[]) {
    super();
  }

  hasComponent(name: string): boolean {
    return !!this.components.find((path) => path.endsWith(`/${name}`));
  }

  hasHelper(name: string): boolean {
    return !!this.helpers.find((path) => path.endsWith(`/${name}`));
  }
}

function populateInvokeables(telemetry: Telemetry): [components: string[], helpers: string[]] {
  const components = [];
  const helpers = [];

  for (const [name, datum] of Object.entries(telemetry)) {
    switch (datum.type) {
      case 'Component':
        components.push(name);
        break;
      case 'Helper':
        helpers.push(name);
        break;
    }
  }

  return [components, helpers];
}

const EMBROIDER_COMPONENTS = '#embroider_compat/components';
const EMBROIDER_HELPERS = '#embroider_compat/helpers';
const EMBROIDER_AMBIGUOUS = '#embroider_compat/ambiguous';

export type NodeResolution = { type: 'virtual' } | { type: 'real' } | { type: 'not_found' };

export interface HasNodeResolve {
  nodeResolve(specifier: string, fromFile: string): NodeResolution;
}

export class EmbroiderResolver extends Resolver {
  static build(): EmbroiderResolver {
    // FIXME: Run build via execa ???
    const stage2Output = readFileSync('dist/.stage2-output', 'utf8');
    const resolver = new _EmbroiderResolver(
      JSON.parse(readFileSync(resolve(stage2Output, '.embroider/resolver.json'), 'utf8'))
    );
    return new EmbroiderResolver(resolver, resolve(stage2Output, 'app.js'));
  }

  constructor(private _resolver: HasNodeResolve, private entryPoint: string) {
    super();
  }

  override hasComponent(name: string): boolean {
    return this.resolve(`${EMBROIDER_COMPONENTS}/${name}`);
  }

  override hasHelper(name: string): boolean {
    return this.resolve(`${EMBROIDER_HELPERS}/${name}`);
  }

  override hasAmbiguous(name: string): boolean {
    return this.resolve(`${EMBROIDER_AMBIGUOUS}/${name}`);
  }

  private resolve(specifier: string): boolean {
    console.log(`Resolving ${specifier}`);
    const resolution = this._resolver.nodeResolve(specifier, this.entryPoint);
    switch (resolution.type) {
      case 'real':
      case 'virtual':
        return true;
      case 'not_found':
        return false;
    }
  }
}

export class MockResolver extends Resolver {
  private static components: string[] = [];
  static setComponents(components: string[]) {
    this.components = components;
  }

  private static helpers: string[] = [];
  static setHelpers(helpers: string[]) {
    this.helpers = helpers;
  }

  static build(): MockResolver {
    return new MockResolver(this.components, this.helpers);
  }

  constructor(private components: string[], private helpers: string[]) {
    super();
  }

  hasComponent(name: string): boolean {
    return !!this.components.includes(name);
  }

  hasHelper(name: string): boolean {
    return !!this.helpers.includes(name);
  }
}
