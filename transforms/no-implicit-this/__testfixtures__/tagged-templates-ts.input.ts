import { hbs as echHBS } from 'ember-cli-htmlbars';
import hipHBS from 'htmlbars-inline-precompile';
import echipHBS from 'ember-cli-htmlbars-inline-precompile';

declare const hbs: unknown;

echHBS`
  Hello,
    {{target}}!
  \n
`;

hipHBS`Hello, {{target}}!`;

echipHBS`Hello, {{target}}!`;

hbs`Hello, {{target}}!`;
