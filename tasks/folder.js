const fs = require('fs');

module.exports = {
  questions: [
    {
      type: 'input',
      name: 'folder',
      message: 'Where should it be?',
      initial(input) {
        const hash = input.state.answers;
        if (hash.pkgjson && hash.pkgjson.values.name) return hash.pkgjson.values.name;
        if (hash.pkgjson && hash.pkgjson.values.repo) return hash.pkgjson.values.repo;
        if (hash.name) return hash.name;
        return '';
      }
    }
  ],
  task: {
    name: 'folder',
    title: 'Create Folder',
    order: -1,
    run(answers, ll, util) {
      return new Promise((resolve, reject) => {
        fs.mkdir(answers.folder, err => {
          if (err) return reject(err);
          util.cwd(answers.folder);
          return resolve(`Created folder ${answers.folder}.`);
        });
      });
    }
  }
};
