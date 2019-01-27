const configFile = require('../mixins/configFile');

module.exports = {
  questions: [],
  tasks: [configFile('Create README file', 'readme.md', answers => `# ${answers.name}
> ${answers.desc}`, false)]
};
