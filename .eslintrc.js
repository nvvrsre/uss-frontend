module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react'],
  rules: {
    'no-unused-vars': ['warn', { 'varsIgnorePattern': '^navigate$' }],
    'react/prop-types': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
