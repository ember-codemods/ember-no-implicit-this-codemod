# ember-no-implicit-this-codemod


A collection of codemod's for ember-no-implicit-this-codemod.

## Usage

To run a specific codemod from this project, you would run the following:

```
npx ember-no-implicit-this-codemod http://localhost:4200 path/of/files/ or/some**/*glob.hbs

# or

yarn global add ember-no-implicit-this-codemod
ember-no-implicit-this-codemod http://url/of/local/dev-server path/of/files/ or/some**/*glob.js
```

The codemod accepts the following options:

| Option | Value | Default | Details |
| --- | --- | ---| --- |
| --dont-assume-this | boolean | false | The codemod won't prepend `this.` to `PathExpressions` names which don't appear in a component's telemetry data |

## Transforms

<!--TRANSFORMS_START-->
<!--TRANSFORMS_END-->

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`
