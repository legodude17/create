module.exports = () => ({
  questions: [],
  tasks: [{
    name: 'git',
    title: 'Init Git',
    run(answers, ll, util, state) {
      const commands = [
        'init',
        'add .',
        'commit -m "init"'
      ];
      if (state.github) {
        commands.push(`remote add origin https://github.com/${answers.username}/${answers.repo}`);
        commands.push('push -u origin master');
      }
      commands.forEach((v, i) => ll.addTask({ name: i, title: v }));
      const proms = commands.map((v, i) => () =>
        util.command('git', v)
          .then(() => ll[i].complete('Ran command')));
      return util.series(proms).then(() => 'Git Inited');
    },
    order: 30
  }]
});
