module.exports = function configFile(program, file, contents, config = true) {
  if (typeof contents !== 'function') {
    contents = () => contents;
  }
  return {
    name: file,
    title: config ? `Create ${program} config file` : program,
    run(answers, tl, utils) {
      const cont = contents(answers);
      let prom;
      if (typeof cont === 'string') {
        prom = utils.writeFile(file, cont);
      } else if (Array.isArray(cont)) {
        prom = utils.writeFile(file, cont.filter(Boolean).join('\n'));
      } else {
        prom = utils.write(file, cont);
      }
      return prom.then(() => `Wrote to ${file}`);
    }
  };
};
