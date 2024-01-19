# Changelog
## Release (2024-01-19)

ember-no-implicit-this-codemod 3.0.0 (major)

#### :boom: Breaking Change
* `ember-no-implicit-this-codemod`
  * [#405](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/405) drop support for Node < 16 ([@mansona](https://github.com/mansona))

#### :rocket: Enhancement
* `ember-no-implicit-this-codemod`
  * [#400](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/400) Update ember-codemods-telemetry-helpers for Mac M support ([@Mikek2252](https://github.com/Mikek2252))

#### :house: Internal
* `ember-no-implicit-this-codemod`
  * [#418](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/418) Typescript ([@mansona](https://github.com/mansona))
  * [#416](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/416) setup release-plan ([@mansona](https://github.com/mansona))
  * [#401](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/401) swap to pnpm ([@mansona](https://github.com/mansona))
  * [#409](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/409) add grouping to dependabot config ([@mansona](https://github.com/mansona))

#### Committers: 2
- Chris Manson ([@mansona](https://github.com/mansona))
- Michael Kerr ([@Mikek2252](https://github.com/Mikek2252))

## v2.1.0 (2022-01-11)

#### :rocket: Enhancement
* [#83](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/83) Add `debug` logging ([@Turbo87](https://github.com/Turbo87))
* [#85](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/85) Remove unused logging code ([@Turbo87](https://github.com/Turbo87))

#### :bug: Bug Fix
* [#86](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/86) Fix substring component matches ([@Turbo87](https://github.com/Turbo87))

#### Committers: 4
- Dan Freeman ([@dfreeman](https://github.com/dfreeman))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v2.0.0 (2019-12-15)

#### :bug: Bug Fix
* [#80](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/80) Fix `hasBlock` handling ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#82](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/82) Replace `recast.transform()` call with `recast.traverse()` ([@Turbo87](https://github.com/Turbo87))
* [#81](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/81) known-helpers: Remove helpers from addons ([@Turbo87](https://github.com/Turbo87))
* [#79](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/79) Remove unused `listr` dependency ([@Turbo87](https://github.com/Turbo87))
* [#70](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/70) Move `getTelemetry()` call out of `plugin.js` file ([@Turbo87](https://github.com/Turbo87))
* [#67](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/67) Use Jest directly ([@Turbo87](https://github.com/Turbo87))

#### Committers: 2
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v1.0.1 (2019-12-14)

#### :bug: Bug Fix
* [#65](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/65) Fix broken `path.parts` condition ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#66](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/66) Add `ember-holy-futuristic-template-namespacing-batman` test cases ([@Turbo87](https://github.com/Turbo87))
* [#64](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/64) CI: Run with code coverage tracking ([@Turbo87](https://github.com/Turbo87))

#### Committers: 1
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))

## v1.0.0 (2019-12-14)

#### :boom: Breaking Change
* [#62](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/62) Rewrite `PathExpression` visitor code ([@Turbo87](https://github.com/Turbo87))

#### :rocket: Enhancement
* [#62](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/62) Rewrite `PathExpression` visitor code ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#54](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/54) Remove unused explicit dependencies ([@Turbo87](https://github.com/Turbo87))
* [#55](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/55) Add dependabot config file ([@Turbo87](https://github.com/Turbo87))

#### Committers: 2
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

* Merge pull request #50 from suchitadoshi1987/suchita/customHelpers (9713041)
* Merge pull request #49 from suchitadoshi1987/suchita/supportwallstreet (57d0a65)
* Add config option to support custom helpers (c1c4918)
* add support for ember-holy-futuristic-template-namespacing-batman syntax as well as for Nested Invocations in Angle Bracket Syntax (cec9fc4)

## v0.7.3 (2019-10-28)

#### :house: Internal
* [#39](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/39) Improve Integration Tests ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- L. Preston Sego III ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

* Fix incorrect transform of naked pre-existing this (#41) (87fa534)
* update readme with generated transform output (7d7e035)

* Fix @args swapped with this.args (#40) (5f6ae02)
* update telemetry helpers tp (#38) (e3e4c1c)
* Update telemetry-helpers (#37) (4f08318)
* Test multiple ember versions (#29) (cb53ef2)
* Use GitHub Actions for parallel running (4c395fc)
* add 3.13 app (4c259f3)
* move old app to 3.10 (2849e1c)

* add minimal docs + collect telemetry while running the codemod (#8) (27aad4e)
* update readme (5b86872)

* Data attributes smoosh fix (#22) (03d9c79)
* Fixes Void element bug (#23) (9b46cd6)

* Bump telemetry-helpers to 0.4.0 (#21) (16f9e80)
* fix label on readme (9332a1d)
* add badges (#20) (0aaa0ae)
* update readme (3915484)
* use travis.com instead of org (30abe60)
* add badges (9fa0aee)

* Add ES5 getters to telemetry data (#10) (26a181d)



* update readme (cefef89)

## v0.2.0 (2019-08-09)

#### :rocket: Enhancement
* [#2](https://github.com/ember-codemods/ember-no-implicit-this-codemod/pull/2) Initial implementation ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 3
- Dustin Masters ([@dustinsoftware](https://github.com/dustinsoftware))
- L. Preston Sego III ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
- Pat O'Callaghan ([@patocallaghan](https://github.com/patocallaghan))

