# no-implicit-this


## Usage

```
npx ember-no-implicit-this-codemod no-implicit-this path/of/files/ or/some**/*glob.js

# or

yarn global add ember-no-implicit-this-codemod
ember-no-implicit-this-codemod no-implicit-this path/of/files/ or/some**/*glob.js
```

## Input / Output

<!--FIXTURES_TOC_START-->
* [angle-brackets-with-block-params](#angle-brackets-with-block-params)
* [angle-brackets-with-hash-params](#angle-brackets-with-hash-params)
* [angle-brackets-without-params](#angle-brackets-without-params)
* [built-in-helpers](#built-in-helpers)
* [comments](#comments)
* [dont-assume-this](#dont-assume-this)
* [handlebars-with-block-params](#handlebars-with-block-params)
* [handlebars-with-hash-params](#handlebars-with-hash-params)
* [handlebars-with-positional-params](#handlebars-with-positional-params)
* [handlebars-without-params](#handlebars-without-params)
<!--FIXTURES_TOC_END-->

<!--FIXTURES_CONTENT_START-->
---
<a id="angle-brackets-with-block-params">**angle-brackets-with-block-params**</a>

**Input** (<small>[angle-brackets-with-block-params.input.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-with-block-params.input.hbs)</small>):
```hbs
<SomeComponent as |foo hash components|>
  {{foo}}
  {{hash.property}}

  <components.foo as |property|>
    {{property}}
  </components.foo>

  <components.bar />

</SomeComponent>

```

**Output** (<small>[angle-brackets-with-block-params.output.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-with-block-params.output.hbs)</small>):
```hbs
<SomeComponent as |foo hash components|>
  {{foo}}
  {{hash.property}}

  <components.foo as |property|>
    {{property}}
  </components.foo>

  <components.bar />

</SomeComponent>

```
---
<a id="angle-brackets-with-hash-params">**angle-brackets-with-hash-params**</a>

**Input** (<small>[angle-brackets-with-hash-params.input.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-with-hash-params.input.hbs)</small>):
```hbs
<a href='invalid-url' disabled></a>
<input value="something">

<SomeComponent @arg="value" />
<SomeComponent @arg=1 />
<SomeComponent @arg=foo />
<SomeComponent @arg={{foo}} @bar={{property}} />
<SomeComponent @arg={{foo}} @bar={{fn myAction}} />

```

**Output** (<small>[angle-brackets-with-hash-params.output.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-with-hash-params.output.hbs)</small>):
```hbs
<a href='invalid-url' disabled></a>
<input value="something">

<SomeComponent @arg="value" />
<SomeComponent @arg=1 />
<SomeComponent @arg=foo />
<SomeComponent @arg={{this.foo}} @bar={{this.property}} />
<SomeComponent @arg={{this.foo}} @bar={{fn this.myAction}} />

```
---
<a id="angle-brackets-without-params">**angle-brackets-without-params**</a>

**Input** (<small>[angle-brackets-without-params.input.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-without-params.input.hbs)</small>):
```hbs
<a></a>
<br>
<br />
<foo />
<foo></foo>
<Foo />
<Foo></Foo>

```

**Output** (<small>[angle-brackets-without-params.output.hbs](transforms/no-implicit-this/__testfixtures__/angle-brackets-without-params.output.hbs)</small>):
```hbs
<a></a>
<br>
<br />
<foo />
<foo></foo>
<Foo />
<Foo></Foo>

```
---
<a id="built-in-helpers">**built-in-helpers**</a>

**Input** (<small>[built-in-helpers.input.hbs](transforms/no-implicit-this/__testfixtures__/built-in-helpers.input.hbs)</small>):
```hbs
{{debugger}}
{{has-block}}
{{hasBlock}}
{{input}}
{{outlet}}
{{textarea}}
{{yield}}

{{#let (concat "a" "b") as |ab|}}
  {{ab}}
{{/let}}

{{#each records as |record|}}
  {{record.property}}
{{/each}}


<button {{on 'click' myAction}}>Action</button>
<button {{on 'click' (fn myAction foo)}}>Action</button>

{{link-to 'name' 'route'}}

```

**Output** (<small>[built-in-helpers.output.hbs](transforms/no-implicit-this/__testfixtures__/built-in-helpers.output.hbs)</small>):
```hbs
{{debugger}}
{{has-block}}
{{hasBlock}}
{{input}}
{{outlet}}
{{textarea}}
{{yield}}

{{#let (concat "a" "b") as |ab|}}
  {{ab}}
{{/let}}

{{#each this.records as |record|}}
  {{record.property}}
{{/each}}


<button {{on 'click' this.myAction}}>Action</button>
<button {{on 'click' (fn this.myAction this.foo)}}>Action</button>

{{link-to 'name' 'route'}}

```
---
<a id="comments">**comments**</a>

**Input** (<small>[comments.input.hbs](transforms/no-implicit-this/__testfixtures__/comments.input.hbs)</small>):
```hbs
<!-- foo -->
<div {{!-- foo --}}></div>
<div>{{!-- foo bar --}}<b></b></div>
{{!-- {{foo-bar}} --}}

```

**Output** (<small>[comments.output.hbs](transforms/no-implicit-this/__testfixtures__/comments.output.hbs)</small>):
```hbs
<!-- foo -->
<div {{!-- foo --}}></div>
<div>{{!-- foo bar --}}<b></b></div>
{{!-- {{foo-bar}} --}}

```
---
<a id="dont-assume-this">**dont-assume-this**</a>

**Input** (<small>[dont-assume-this.input.hbs](transforms/no-implicit-this/__testfixtures__/dont-assume-this.input.hbs)</small>):
```hbs
{{foo}}
{{bar}}
```

**Output** (<small>[dont-assume-this.output.hbs](transforms/no-implicit-this/__testfixtures__/dont-assume-this.output.hbs)</small>):
```hbs
{{this.foo}}
{{bar}}
```
---
<a id="handlebars-with-block-params">**handlebars-with-block-params**</a>

**Input** (<small>[handlebars-with-block-params.input.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-block-params.input.hbs)</small>):
```hbs
{{#my-component as |foo myAction hash components|}}
  {{foo}} {{myAction}}
  {{hash.property}} {{hash.foo}}

  {{components.foo}}

  {{#components.my-component}}

  {{/components.my-component}}

  {{#components.block as |block|}}
    {{block}}
  {{/components.block}}
{{/my-component}}


```

**Output** (<small>[handlebars-with-block-params.output.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-block-params.output.hbs)</small>):
```hbs
{{#my-component as |foo myAction hash components|}}
  {{foo}} {{myAction}}
  {{hash.property}} {{hash.foo}}

  {{components.foo}}

  {{#components.my-component}}

  {{/components.my-component}}

  {{#components.block as |block|}}
    {{block}}
  {{/components.block}}
{{/my-component}}


```
---
<a id="handlebars-with-hash-params">**handlebars-with-hash-params**</a>

**Input** (<small>[handlebars-with-hash-params.input.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-hash-params.input.hbs)</small>):
```hbs
{{my-component arg="string"}}
{{my-component arg=2}}
{{my-component arg=foo}}
{{my-component arg=property}}
{{my-component arg=(my-helper property)}}
{{my-component arg=(my-helper (fn myAction property) foo)}}
{{my-component arg=property arg2=foo}}
{{my-component arg=property arg2=(fn myAction foo)}}


```

**Output** (<small>[handlebars-with-hash-params.output.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-hash-params.output.hbs)</small>):
```hbs
{{my-component arg="string"}}
{{my-component arg=2}}
{{my-component arg=this.foo}}
{{my-component arg=this.property}}
{{my-component arg=(my-helper this.property)}}
{{my-component arg=(my-helper (fn this.myAction this.property) this.foo)}}
{{my-component arg=this.property arg2=this.foo}}
{{my-component arg=this.property arg2=(fn this.myAction this.foo)}}


```
---
<a id="handlebars-with-positional-params">**handlebars-with-positional-params**</a>

**Input** (<small>[handlebars-with-positional-params.input.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-positional-params.input.hbs)</small>):
```hbs
{{my-component "string"}}
{{my-component 1}}
{{my-component foo}}
{{my-component property}}
{{my-component (my-helper property)}}
{{my-component (my-helper "string")}}
{{my-component (my-helper 1)}}


```

**Output** (<small>[handlebars-with-positional-params.output.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-with-positional-params.output.hbs)</small>):
```hbs
{{my-component "string"}}
{{my-component 1}}
{{my-component this.foo}}
{{my-component this.property}}
{{my-component (my-helper this.property)}}
{{my-component (my-helper "string")}}
{{my-component (my-helper 1)}}


```
---
<a id="handlebars-without-params">**handlebars-without-params**</a>

**Input** (<small>[handlebars-without-params.input.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-without-params.input.hbs)</small>):
```hbs
{{my-component}}
{{a-helper}}
{{foo}}
{{property}}
{{namespace/foo}}
{{someGetter}}

```

**Output** (<small>[handlebars-without-params.output.hbs](transforms/no-implicit-this/__testfixtures__/handlebars-without-params.output.hbs)</small>):
```hbs
{{my-component}}
{{a-helper}}
{{this.foo}}
{{this.property}}
{{namespace/foo}}
{{this.someGetter}}

```
<!--FIXTURES_CONTENT_END-->