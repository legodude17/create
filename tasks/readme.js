const configFile = require('../mixins/configFile');

module.exports = {
  questions: [],
  task: configFile('Create README file', 'readme.md', answers => `# ${answers.name}
> ${answers.desc}`, false)
};
