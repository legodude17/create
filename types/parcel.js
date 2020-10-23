const { setState } = require('../helpers');
const babel = require('../plugins/babel');
const configFile = require('../plugins/configFile');
const entry = require('../plugins/entry');
const eslint = require('../plugins/eslint');
const folder = require('../plugins/folder');
const git = require('../plugins/git');
const github = require('../plugins/github');
const gitignore = require('../plugins/gitignore');
const npmInstall = require('../plugins/npmInstall');
const pkgjson = require('../plugins/pkgjson');
const react = require('../plugins/react');
const readme = require('../plugins/readme');

module.exports = {
  language: 'JavaScript',
  type: 'parcel',
  questions: [],
  tasks: [setState(state => {
    state.npmPackages.push('parcel-bundler');
  })],
  plugins: [
    npmInstall(),
    configFile(),
    pkgjson(),
    folder(),
    entry('src/index.js'),
    eslint(answers => ({
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
    })),
    babel(answers => [['env', { modules: false }], answers.react && 'react']),
    react(),
    readme(),
    gitignore(['dist', '.cache']),
    git(),
    github()
  ]
};
