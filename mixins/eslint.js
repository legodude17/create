const configFile = require('./configFile');

module.exports = function eslint(type) {
  type.questions.push({
    type: 'confirm',
    name: 'eslint',
    message: 'Use eslint?'
  });

  const eslintrc = configFile('eslint', '.eslintrc', {
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
  });

  eslintrc.when = answers => answers.eslint;

  type.tasks.push(eslintrc);

  const { packages } = type;

  type.packages = answers => packages(answers).concat(answers.eslint &&
    [
      'eslint',
      'eslint-config-airbnb-base',
      'eslint-plugin-import'
    ]);

  return type;
};
