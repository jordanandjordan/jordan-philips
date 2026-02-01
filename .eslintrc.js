module.exports = {
  root: true,
  extends: ['airbnb', 'airbnb/hooks'],
  globals: {
    window: true,
    document: true,
  },
  rules: {
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'linebreak-style': 0,
    'no-console': 'off',
    'no-debugger': 'off',
  },
};
