```ts
  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    // staticComponents: true,
    // staticModifiers: true,
    // staticHelpers: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
```

1. Find '@embroider/webpack' entry point
2. Look at second arg to `compatBuild`
3. ...?

FIXME: Refactor cli.js
FIXME: optional deps?
FIXME: rename resolver -> telemetry
FIXME: move custom helpers into resolver?

FIXME: Clean up logging shenanigans (e.g. console.log/info, debug)

FIXME: Figure out how to pass no-babel option to jscodeshift via codemod-cli

FIXME: Extract ember codemod buildtime resolver

FIXME: Optional angle-bracketification?


# TODO

- [ ] Make telemetry pluggable
- [ ] Maybe Discourse can make their own Telemetry plugin
- [ ] Embroider telemetry plugin[1]

## Problems

[1] Embroider compat tries to link up your modules by emitting the implicit imports.

## Questions for tomorrow

1. How does the angle bracket codemod work?

## Questions for EF4

1. Is this even possible?!?

```ts
{{ambiguous}} ->
  1. <Ambiguous>
  2. {{(ambiguous)}}
  3. {{this.ambiguous}}
  4. {{ambiguous}} //modifier

  1. leave it alone
  2. change to {{this.ambiguous}}
  (3. error?)

enum DisambiguateResult {
    LeaveIt,
    ChangeIt,
    CantDoIt,
}

enum Namespace {
    Helper,
    Component,
    ComponentOrHelper,
    Modifier,
}

function disambiguate(headName: string, namespace: Namespace, ...?): DisambiguateResult {
    // ...
    // SOMETHING SOMETHING PLUG IN EMBROIDER
}



```