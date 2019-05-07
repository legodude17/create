const configFile = require('../mixins/configFile');

module.exports = {
  type: 'parcel',
  questions: [{
    type: 'confirm',
    name: 'babel',
    message: 'Use babel?'
  }, {
    type: 'confirm',
    name: 'eslint',
    message: 'Use eslint?'
  }, {
    type: 'confirm',
    message: 'Use react?',
    name: 'react',
    skip() {
      return !this.state.answers.babel;
    }
  }],
  packages: answers => [
    'parcel-bundler',
    answers.babel && 'babel-preset-env',
    answers.react && 'babel-preset-react',
    'eslint',
    `eslint-config-airbnb${answers.react ? '' : '-base'}`,
    answers.react && 'eslint-plugin-react',
    answers.react && 'eslint-plugin-jsx-a11y'
  ],
  tasks: [Object.assign(configFile('babel', '.babelrc', answers => ({
    presets: [['env', { modules: false }], answers.react && 'react'].filter(Boolean)
  })), { when: answers => answers.babel }), Object.assign(configFile('eslint', '.eslintrc', answers => ({
    extends: `airbnb${answers.react ? '' : '-base'}`,
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
  })), {
    when: answers => answers.eslint
  })],
  entry: 'src/index.js'
};
