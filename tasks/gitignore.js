module.exports = {
  questions: [],
  tasks: [{
    name: 'gitignore',
    title: 'Create gitignore',
    order: 2,
    run(answers, tl, utils) {
      const gitignore = [
        'node_modules/',
        answers.type !== 'basic' && 'dist/',
        answers.type === 'parcel' && '.cache/'
      ].filter(Boolean).join('\n');
      return utils.writeFile('.gitignore', gitignore).then(() => 'Wrote to .gitignore');
    }
  }]
};
