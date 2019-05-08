const eslint = require('../mixins/eslint');
const babel = require('../mixins/babel');
const configFile = require('../mixins/configFile');

module.exports = babel(eslint({
  type: 'rollup',
  questions: [],
  packages: answers => ['rollup', 'rollup-plugin-node-resolve', answers.babel && 'rollup-plugin-babel@beta'],
  tasks: [configFile('rollup', 'rollup.config.js', answers => [
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
  ])],
  entry: 'src/index.js'
}));
