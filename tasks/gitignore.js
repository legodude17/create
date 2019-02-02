const configFile = require('../mixins/configFile');

module.exports = {
  questions: [],
  task: Object.assign(configFile('Create gitignore', '.gitignore', answers => [
    'node_modules/',
    answers.type !== 'basic' && 'dist/',
    answers.type === 'parcel' && '.cache/'
  ], false), { order: 2 })
};
