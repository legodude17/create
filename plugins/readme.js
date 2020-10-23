const { setState } = require('../helpers');

module.exports = () => ({
  questions: [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the project?',
      when(answers) {
        return answers.pkgjson != null && answers.pkgjson.name != null;
      }
    },
    {
      type: 'input',
      name: 'desc',
      message: 'What is the description of the project?',
      when(answers) {
        return answers.pkgjson != null && answers.pkgjson.description != null;
      }
    }
  ],
  tasks: [
    setState(state => state.configs.push({
      name: 'readme',
      file: 'README.md',
      contents: answers => `# ${answers.name || (answers.pkgjson && answers.pkgjson.name)}

${answers.desc || (answers.pkgjson && answers.pkgjson.desc)}`
    }))
  ]
});
