module.exports = (entry) => ({
  questions: [
    {
      type: 'input',
      name: 'entry',
      message: 'What is the entrypoint?',
      initial: entry
    }],
  tasks: [{
    name: 'entry',
    title: 'Create Entrypoint',
    run(answers, ll, utils, state) {
      const { entry } = answers;
      state.entrypoint = answers;
      ll.addTask({ name: 'folder', title: 'Make folder' });
      const folder = utils.resolve(utils.path.dirname(entry));
      return utils.mkdirp(folder).then(() => {
        ll.folder.complete(`Created folder ${folder}`);
        return utils.writeFile(entry, '// ENTRYPOINT');
      }).then(() => `Created ${entry}`);
    },
    order: 3
  }]
});
