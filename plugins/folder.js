module.exports = () => ({
  questions: [
    {
      type: 'input',
      name: 'folder',
      message: 'Where should it be?',
      initial(answers) {
        if (answers.pkgjson && answers.pkgjson.values.name) return answers.pkgjson.values.name;
        if (answers.pkgjson && answers.pkgjson.values.repo) return answers.pkgjson.values.repo;
        if (answers.name) return answers.name;
        return '';
      },
      order: -1
    }
  ],
  tasks: [{
    name: 'folder',
    title: 'Create Folder',
    order: -50,
    run(answers, ll, util) {
      return util.mkdirp(answers.folder).then(() => {
        util.cwd(answers.folder);
        return `Created ${answers.folder}`;
      });
    }
  }]
});
