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
        message: 'What type of project is this? ',
        choices: types.map(type => type.type)
      },
      {
        type: 'input',
        name: 'entry',
        message: 'What is the entrypoint?',
        initial(input) {
          const { type } = input.state.answers;
          return types.filter(t => t.type === type)[0].entry;
        }
      }
    ].concat(types.reduce(
      (arr, type) => arr.concat(type.questions.map(question => Object.assign(
        question,
        {
          when: hash => hash.type === type.type
        }
      ))),
      []
    )),
    tasks: types.reduce(
      (arr, type) => arr.concat(type.tasks.map(task => Object.assign(task, {
        when: answers => answers.type === type.type
      }))),
      []
    ).concat({
      when: () => true,
      name: 'install',
      title: 'Install Packages',
      run(answers, ll, utils) {
        const { packages } = types.filter(type => type.type === answers.type)[0](answers).filter(Boolean);
        packages.forEach(pkg => ll.addTask({ name: pkg, title: `Install ${pkg}` }));
        return Promise.all(packages
          .map(pkg => utils.execa.shell(`npm i -D ${pkg}`))
          .map((prom, i) =>
            prom.then(() => ll[packages[i]].complete('Installed'))))
          .then(() => 'Installed all packages');
      }
    }).concat({
      when: () => true,
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
      }
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
