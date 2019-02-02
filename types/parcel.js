const eslint = require('../mixins/eslint');
const babel = require('../mixins/babel');
const configFile = require('../mixins/configFile');

module.exports = babel(eslint({
  type: 'parcel',
  questions: [{
    type: 'confirm',
    name: 'babel',
    message: 'Use babel?'
  }],
  packages: () => ['parcel-bundler'],
  tasks: [],
  entry: 'src/index.js'
}));
