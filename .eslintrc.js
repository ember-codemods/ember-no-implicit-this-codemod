module.exports = {
    root: true,
    parserOptions: {
      ecmaVersion: 2017
    },
    env: {
      node: true,
      es6: true
    },

    parser: '@typescript-eslint/parser',
    plugins: ['prettier', '@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'prettier/@typescript-eslint',
    ],
    rules: {
      "prettier/prettier": "error"
    },
    overrides: [
      {
        files: ['**/*.test.js'],
        env: {
          jest: true
        }
      }
    ]
  };
