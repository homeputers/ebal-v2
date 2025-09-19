const base = require('@ebal/config/eslint');

module.exports = {
  ...base,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.playwright.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: [...(base.plugins || []), '@typescript-eslint', 'i18next'],
  extends: [...(base.extends || []), 'plugin:@typescript-eslint/recommended', 'plugin:react/jsx-runtime'],
  overrides: [
    ...(base.overrides || []),
    {
      files: ['**/*.tsx'],
      excludedFiles: ['**/*.test.tsx', '**/*.spec.tsx', '**/__tests__/**/*'],
      rules: {
        'i18next/no-literal-string': [
          'warn',
          {
            mode: 'jsx-text-only',
          },
        ],
      },
    },
  ],
};
