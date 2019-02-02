const configFile = require('./configFile');

module.exports = function babel(type) {
  type.questions.push({
    type: 'confirm',
    name: 'babel',
    message: 'Use babel?'
  });

  const babelrc = configFile('babel', '.babelrc', answers => ({
    presets: [['env', { modules: false }]]
  }));

  babelrc.when = answers => answers.babel;

  type.tasks.push(babelrc);

  const { packages } = type;

  type.packages = answers => packages(answers).concat(answers.babel &&
    [
      '@babel/core',
      '@babel/preset-env'
    ]);

  return type;
};
