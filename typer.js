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
        type: 'list',
        name: 'type',
        message: 'What type of project is this? ',
        choices: types.map(type => type.type)
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
      desc: 'Install Packages',
      run(answers, ll, utils) {
        const { packages } = types.filter(type => type.type === answers.type)[0];
        packages.forEach(pkg => ll.addTask({ name: pkg, title: `Install ${pkg}` }));
        return Promise.all(packages
          .map(pkg => utils.execa.shell(`npm i -D ${pkg}`))
          .map((prom, i) =>
            prom.then(() => ll[packages[i]].complete('Installed'))))
          .then(() => answers);
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
  tasks: []
}

*/
