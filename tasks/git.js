module.exports = {
  questions: [],
  task: {
    name: 'git',
    title: 'Init Git',
    run(answers, ll, util) {
      const commands = [
        'git init',
        'git add .',
        'git commit -m "init"'
      ];
      if (answers.github) {
        commands.push(`git remote add origin https://github.com/${answers.username}/${answers.repo}`);
        commands.push('git push -u origin master');
      }
      commands.forEach((v, i) => ll.addTask({ name: i, title: v }));
      const proms = commands.map((v, i) => () =>
        util.execa.shell(v)
          .then(() => ll[i].complete('Ran command')));
      return util.series(proms).then(() => 'Git Inited');
    },
    order: -1
  }
};
