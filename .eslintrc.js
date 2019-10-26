module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 2017
    },
    env: {
      node: true,
      es6: true
    },
    extends: ["eslint:recommended", "prettier"],
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "error"
    },
    overrides: [
      {
        files: ['**/*.ts'],
        parser: '@typescript-eslint/parser',
        plugins: ['prettier', '@typescript-eslint'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'prettier',
          'prettier/@typescript-eslint',
        ],
      },
      {
        files: ['**/*.test.js'],
        env: {
          jest: true
        }
      }
    ]
};
