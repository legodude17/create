const { setState } = require('../helpers');

module.exports = (babelrc = {
  presets: [['env', { modules: false }]]
}) => ({
  questions: [{
    type: 'confirm',
    name: 'babel',
    message: 'Use babel?',
    initial: true
  }],
  tasks: [
    setState(state => {
      state.configs.push({
        program: 'babel',
        file: '.babelrc',
        contents: babelrc
      });
      state.npmPackages.push('@babel/core');
      state.npmPackages.push('@babel/preset-env');

      state.babel = true;
    }, answers => answers.babel)
  ]
});
