const base = require('@ebal/config/eslint');

module.exports = {
  ...base,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [...(base.plugins || []), '@typescript-eslint'],
  extends: [...(base.extends || []), 'plugin:@typescript-eslint/recommended', 'plugin:react/jsx-runtime'],
};
