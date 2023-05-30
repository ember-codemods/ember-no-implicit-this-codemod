import { Telemetry, getTelemetry } from './telemetry';

export default abstract class Resolver {
  has(type: 'component' | 'helper' | 'ambiguous', name: string): boolean {
    switch (type) {
      case 'component':
        return this.hasComponent(name);
      case 'helper':
        return this.hasHelper(name);
      case 'ambiguous':
        return this.hasAmbiguous(name);
    }
  }

  abstract hasComponent(name: string): boolean;
  abstract hasHelper(name: string): boolean;

  hasAmbiguous(name: string): boolean {
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
