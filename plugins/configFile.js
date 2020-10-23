const { setState } = require('../helpers');

module.exports = function configFile() {
  return {
    questions: [],
    tasks: [
      setState({ configs: [] }, null, -100),
      {
        name: 'config',
        title: 'Create config files',
        run(answers, tl, utils, state) {
          return Promise.all(state.configs.map(config => {
            tl.addTask({ name: config.file, title: `Create ${config.file}` });
            let cont = config.contents;
            if (typeof cont === 'function') {
              cont = cont(answers);
            }
            let prom;
            if (typeof cont === 'string') {
              prom = utils.writeFile(config.file, cont);
            } else if (Array.isArray(cont)) {
              prom = utils.writeFile(config.file, cont.filter(Boolean).join('\n'));
            } else {
              prom = utils.write(config.file, cont);
            }
            return prom.then(() => tl[config.file].complete(`Wrote to ${config.file}`));
          })).then(() => 'Wrote all config files');
        },
        order: 10
      }
    ]
  };
};
