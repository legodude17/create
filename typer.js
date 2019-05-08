module.exports = function typer(types) {
  if (types.length === 0) {
    return {
      questions: [],
      tasks: []
    };
  }
  return {
    questions: [
      {
        type: 'select',
        name: 'type',
        message: 'What type of project is this?',
        choices: types.map(type => type.type)
      },
      {
        type: 'input',
        name: 'entry',
        message: 'What is the entrypoint?',
        initial(prompt) {
          const { type } = prompt.state.answers;
          return types.filter(t => t.type === type)[0].entry;
        }
      }
    ].concat(types.reduce(
      (arr, type) => arr.concat(type.questions.map((question, i, _, skip = question.skip) => Object.assign(
        question,
        {
          skip() {
            return this.state.answers.type !== type.type || (!!skip && skip.call(this));
          }
        }
      ))),
      []
    )),
    tasks: types.reduce(
      (arr, type) => arr.concat(type.tasks.map((task, i, _, when = task.when) => Object.assign(task, {
        when(answers) {
          return answers.type === type.type && (!when || when.call(task, answers));
        }
      }))),
      []
    ).concat({
      name: 'install',
      title: 'Install Packages',
      run(answers, ll, utils) {
        const packages = types.filter(type => type.type === answers.type)[0].packages(answers).filter(Boolean);
        packages.forEach(pkg => ll.addTask({ name: pkg, title: `Install ${pkg}` }));
        return Promise.all(packages
          .map(pkg => utils.execa.shell(`npm i -D ${pkg}`, { cwd: process.cwd() }))
          .map((prom, i) =>
            prom.then(() => ll[packages[i]].complete('Installed'))))
          .then(() => `Installed ${packages.join(', ')}`);
      },
      order: -2
    }).concat({
      name: 'entry',
      title: 'Create Entrypoint',
      run(answers, ll, utils) {
        const { entry } = answers;
        ll.addTask({ name: 'folder', title: 'Make folder' });
        const folder = utils.path.dirname(entry);
        return utils.mkdirp(folder).then(() => {
          ll.folder.complete(`Created folder ${folder}`);
          return utils.writeFile(entry, '// ENTRYPOINT');
        }).then(() => `Created ${entry}`);
      },
      order: 3
    })
  };
};

/*
type is:
{
  type: '',
  questions: [],
  packages: [],
  tasks: [],
  entry: ''
}

*/
