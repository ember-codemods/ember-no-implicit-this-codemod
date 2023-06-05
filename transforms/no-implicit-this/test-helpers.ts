import { MockResolver } from './helpers/resolver';

const MOCK_COMPONENTS = [
  'block-component',
  'foo-bar-baz',
  'foo',
  'my-component',
  'namespace/foo',
  'namespace/my-component',
  'some-component',
];

const MOCK_HELPERS = ['a-helper', 'my-helper'];

export function setupResolver() {
  MockResolver.setComponents(MOCK_COMPONENTS);
  MockResolver.setHelpers(MOCK_HELPERS);
}
