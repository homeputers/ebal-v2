module.exports = {
  contextSeparator: '_',
  defaultNamespace: 'common',
  namespaceSeparator: ':',
  keySeparator: '.',
  locales: ['en', 'es'],
  output: 'src/locales/_extracted/$LOCALE/$NAMESPACE.json',
  input: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/locales/**',
  ],
  createOldCatalogs: false,
  indentation: 2,
  sort: true,
};
