const eslint = require('../mixins/eslint');

module.exports = eslint({
  type: 'rollup',
  questions: [{
    type: 'confirm',
    name: 'babel',
    message: 'Use babel?'
  }],
  packages: answers => ['rollup', 'rollup-plugin-node-resolve', answers.babel && 'rollup-plugin-babel@beta'],
  tasks: [{
    name: 'rollup.config.js',
    title: 'Create rollup config file',
    run(answers, tl, utils) {
      const rollupConfig = [
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
      ].filter(Boolean).join('\n');
      return utils.writeFile('rollup.config.js', rollupConfig).then(() => 'Wrote to rollup.config.js');
    }
  }, {
    name: 'babelrc',
    title: 'Create babel config file',
    run(answers, tl, utils) {
      const babelrc = {
        presets: [['env', { modules: false }]]
      };
      return utils.write('.babelrc', babelrc).then(() => 'Wrote to .babelrc');
    }
  }],
  entry: 'src/index.js'
});
