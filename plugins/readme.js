const { setState } = require('../helpers');

module.exports = () => ({
  questions: [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the project?',
      when(answers) {
        return answers.pkgjson == null;
      },
      initial: answers => answers.folder,
      order: -1
    },
    {
      type: 'input',
      name: 'desc',
      message: 'What is the description of the project?',
      when(answers) {
        return answers.pkgjson == null;
      },
      order: -1
    }
  ],
  tasks: [
    setState(state => state.configs.push({
      name: 'readme',
      file: 'README.md',
      contents: answers => `# ${answers.name || (answers.pkgjson && answers.pkgjson.values.name)}
> ${answers.desc || (answers.pkgjson && answers.pkgjson.values.description)}`
    }))
  ]
});
