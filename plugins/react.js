const { setState } = require('../helpers');

module.exports = () => ({
  questions: [{
    type: 'confirm',
    message: 'Use react?',
    name: 'react',
    when: answers => answers.babel,
    order: 1,
    initial: true
  }],
  tasks: setState({ react: true }, answers => answers.react, -100)
});
