const eslint = require('../mixins/eslint');

module.exports = eslint({
  type: 'basic',
  questions: [],
  packages: () => [],
  tasks: [],
  entry: 'index.js'
});
