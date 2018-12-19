const fs = require('fs');

module.exports = {
  questions: [
    {
      type: 'input',
      name: 'folder',
      message: 'Where should it be?'
    }
  ],
  task: {
    name: 'folder',
    title: 'Create Folder',
    run(answers) {
      return new Promise((resolve, reject) => {
        fs.mkdir(answers.folder, err => {
          if (err) return reject(err);
          process.chdir(answers.folder);
          return resolve(`Created folder ${answers.folder}.`);
        });
      });
    }
  }
};
