import Debug from 'debug';
import { parse, print } from 'ember-template-recast';
import { API, FileInfo, Transform } from 'jscodeshift';
import path from 'node:path';
import { Runner } from './helpers/options';
import transform from './helpers/plugin';
import Resolver from './helpers/resolver';
import { isEmberTemplate } from './helpers/tagged-templates';

const debug = Debug('ember-no-implicit-this-codemod:transform');

/**
 * Given the location and source text of a template, as well as codemod options,
 * returns the rewritten template contents with `this` references inserted where
 * necessary.
 */
function rewriteTemplate(path: string, source: string, resolver: Resolver): string {
  debug('Parsing %s ...', path);
  const root = parse(source);

  debug('Transforming %s ...', path);
  transform(root, resolver);

  debug('Generating new content for %s ...', path);
  return print(root);
}

/**
 * Given a JS or TS file that potentially has embedded templates within it,
 * returns updated source with those templates rewritten to include `this`
 * references where needed.
 */
function rewriteEmbeddedTemplates(
  file: FileInfo,
  resolver: Resolver,
  { jscodeshift }: API
): string {
  return (
    jscodeshift(file.source)
      // @ts-expect-error FIXME: UGH
      .find('TaggedTemplateExpression', { tag: { type: 'Identifier' } })
      .forEach((path) => {
        if (isEmberTemplate(path)) {
          // @ts-expect-error FIXME: UGH
          const { value } = path.node.quasi.quasis[0];
          value.raw = rewriteTemplate(file.path, value.raw, resolver);
        }
      })
      .toSource()
  );
}

// FIXME: Ensure this is what is happening
/**
 * | Result       | How-to                      | Meaning                                            |
 * | :------      | :------                     | :-------                                           |
 * | `errors`     | `throw`                     | we attempted to transform but encountered an error |
 * | `unmodified` | return `string` (unchanged) | we attempted to transform but it was unnecessary   |
 * | `skipped`    | return `undefined`          | we did not attempt to transform                    |
 * | `ok`         | return `string` (changed)   | we successfully transformed                        |
 */
const transformer: Transform = function transformer(file, api) {
  const extension = path.extname(file.path).toLowerCase();
  const runner = Runner.fromCodemodOptions();
  const resolver = runner.buildResolver();
  if (extension === '.hbs') {
    return rewriteTemplate(file.path, file.source, resolver);
  } else if (extension === '.js' || extension === '.ts') {
    return rewriteEmbeddedTemplates(file, resolver, api);
  } else {
    debug('Skipping %s because it does not match a known extension with templates', file.path);
    return;
  }
};

export default transformer;

// Set the parser, needed for supporting decorators
export { default as parser } from './helpers/parse';
