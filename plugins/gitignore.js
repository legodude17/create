const { setState } = require('../helpers');

module.exports = files => ({
  questions: [],
  tasks: [
    setState(state => {
      state.configs.push({
        program: 'git',
        file: '.gitignore',
        contents: ['node_modules'].concat(files)
      });
    }, null, 2)
  ]
});
