# ember-no-implicit-this-codemod

[![Build Status](https://travis-ci.org/ember-codemods/ember-no-implicit-this-codemod.svg?branch=master)](https://travis-ci.org/ember-codemods/ember-no-implicit-this-codemod)

[![npm](https://img.shields.io/npm/v/ember-no-implicit-this-codemod.svg?label=App)](https://www.npmjs.com/package/ember-no-implicit-this-codemod)


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
* [no-implicit-this](transforms/no-implicit-this/README.md)
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
