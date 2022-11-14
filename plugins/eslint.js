const { setState } = require('../helpers');

module.exports = (eslintrc = {
  extends: 'airbnb-base',
  rules: {
    'no-multi-assign': 'off',
    'no-shadow': 'off',
    'no-return-assign': 1,
    'arrow-parens': 'off',
    'max-len': ['warn', { code: 120 }],
    'comma-dangle': ['error', 'never'],
    'no-restricted-syntax': ['error', 'WithStatement', "BinaryExpression[operator='in']"],
    indent: ['error', 2],
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off'
  }
}) => ({
  questions: [{
    type: 'confirm',
    name: 'eslint',
    message: 'Use eslint?',
    initial: true
  }],
  tasks: [
    setState((state) => {
      state.configs.push({
        program: 'eslint',
        file: '.eslintrc',
        contents: eslintrc
      });
      state.npmPackages.push('eslint');
      state.npmPackages.push('eslint-plugin-import');
      if (state.react) {
        state.npmPackages.push('eslint-config-airbnb');
        state.npmPackages.push('eslint-plugin-jsx-a11y');
        state.npmPackages.push('eslint-plugin-react');
      } else {
        state.npmPackages.push('eslint-config-airbnb-base');
      }

      state.eslint = true;
    }, answers => answers.eslint)
  ]
});
