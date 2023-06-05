import { ASTNode } from 'ast-types';
import { NodePath } from 'ast-types/lib/node-path';

const TEMPLATE_TAG_IMPORTS = [
  { source: 'ember-cli-htmlbars', name: 'hbs' },
  { source: 'htmlbars-inline-precompile', name: 'default' },
  { source: 'ember-cli-htmlbars-inline-precompile', name: 'default' },
];

// Identifies whether a TaggedTemplateExpression corresponds to an Ember template
// using one of a known set of `hbs` tags.
export function isEmberTemplate(path: NodePath<ASTNode, ASTNode>) {
  const tag = path.get('tag');
  // @ts-expect-error FIXME: UGH
  const hasInterpolation = path.node.quasi.quasis.length !== 1;
  const isKnownTag = TEMPLATE_TAG_IMPORTS.some(({ source, name }) =>
    isImportReference(tag, source, name)
  );

  return isKnownTag && !hasInterpolation;
}

// Determines whether the given identifier is a reference to an export
// from a particular module.
function isImportReference(path: NodePath, importSource: string, importName: string) {
  const scope = path.scope.lookup(path.node.name);
  const bindings = scope ? scope.getBindings() : {};
  const bindingIdentifiers = bindings[path.node.name] || [];

  for (const binding of bindingIdentifiers) {
    const specifier = binding.parent.node;
    const importDeclaration = binding.parent.parent.node;
    const bindingImportedName =
      specifier.type === 'ImportDefaultSpecifier'
        ? 'default'
        : specifier.type === 'ImportSpecifier'
        ? specifier.imported.name
        : null;

    if (bindingImportedName === importName && importDeclaration.source.value === importSource) {
      return true;
    }
  }

  return false;
}
