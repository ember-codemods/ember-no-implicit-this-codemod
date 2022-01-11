import { hbs as echHBS } from 'ember-cli-htmlbars';
import hipHBS from 'htmlbars-inline-precompile';
import echipHBS from 'ember-cli-htmlbars-inline-precompile';
import { hbs } from 'unknown-tag-source';

echHBS`
  Hello,
    {{this.target}}!
  \n
`;

hipHBS`Hello, {{this.target}}!`;

echipHBS`Hello, {{this.target}}!`;

hbs`Hello, {{target}}!`;
