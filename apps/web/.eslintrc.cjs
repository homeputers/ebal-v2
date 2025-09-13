module.exports = {
  root: true,
  extends: [
    require.resolve('@ebal/config/eslint'),
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['tailwind.config.js', 'postcss.config.cjs'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
