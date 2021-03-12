module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
  ],
  rules: {
    eqeqeq: 'error',
    quotes: ['error', 'single'],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'no-undef': 'off',
    'prettier/prettier': ['error'],
  },
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      allowJs: false,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      strict: false,
    },
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    'jest/globals': true,
  },
  settings: {
    jest: {
      version: 26,
    },
  },
};
