const { setState } = require('../helpers');

module.exports = () => ({
  questions: [
    {
      type: 'confirm',
      name: 'install',
      message: 'Install packages?',
      initial: true
    }
  ],
  tasks: [
    setState({ npmPackages: [] }, null, -100),
    {
      name: 'install',
      title: 'Install Packages',
      run(answers, ll, utils, state) {
        const packages = state.npmPackages;
        packages.forEach(pkg => ll.addTask({ name: pkg, title: `Install ${pkg}` }));
        return Promise.all(packages
          .map(pkg => utils.command('npm', `i -D ${pkg}`))
          .map((prom, i) =>
            prom.then(() => ll[packages[i]].complete('Installed'))))
          .then(() => `Installed ${packages.join(', ')}`);
      },
      when(answers) {
        return answers.install;
      },
      order: 10
    }
  ]
});
