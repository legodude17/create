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
const readme = require('../plugins/readme');

module.exports = {
  language: 'JavaScript',
  type: 'rollup',
  questions: [],
  tasks: [
    setState(state => {
      state.configs.push({
        name: 'rollup',
        file: 'rollup.config.js',
        contents: answers => [
          'import resolve from \'rollup-plugin-node-resolve\';',
          answers.babel && 'import babel from \'rollup-plugin-babel\';',
          '',
          'export default {',
          `  input: '${answers.entry.replace(/ /g, '')}',`,
          '  output: {',
          '  file: \'dist/bundle.js\',',
          '    format: \'cjs\'',
          '  },',
          '  plugins: [',
          '    resolve(),',
          answers.babel && '    babel()',
          '  ]',
          '}'
        ]
      });
      state.npmPackages.push('rollup');
      state.npmPackages.push('rollup-plugin-node-resolve');
      if (state.babel) {
        state.npmPackages.push('rollup-plugin-babel@beta');
      }
    }, null, 1)
  ],
  plugins: [
    npmInstall(),
    configFile(),
    pkgjson(),
    folder(),
    entry('src/index.js'),
    babel(),
    eslint(),
    gitignore(['dist', 'node_modules']),
    github(),
    readme(),
    git()
  ]
};
