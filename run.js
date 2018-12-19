const enquirer = require('enquirer');
const ll = require('listr-log');
const makeTyper = require('./typer');
const utils = require('./utils');

module.exports = async function run(plugins, types) {
  const typer = makeTyper(types);
  const questions = plugins.reduce((arr, plugin) => arr.concat(plugin.questions), []).concat(typer.questions);
  const answers = await enquirer.prompt(questions);
  const tasks = plugins.map(plugin => plugin.task).concat(typer.tasks);
  ll.start();
  let tl = null;
  for (const v of tasks) {
    try {
      if (!v.when || v.when(answers)) {
        ll.addTask({ name: v.name, title: v.title });
        tl = ll[v.name];
        const doneStr = await v.run(answers, tl, utils); // eslint-disable-line no-await-in-loop
        tl.complete(doneStr);
        tl = null;
      }
    } catch (e) {
      if (tl) {
        tl.error(e, false);
        ll.renderer.end(e);
        throw e;
        // return;
      }
      throw new Error(`Task ${v.name} failed because ${e.toString()}`);
    }
  }
  ll.renderer.end();
};

/*
plugin is:
{
  questions: [],
  tasks: []
}

question is what inquirer wants

task is:
{
  name: '',
  title: '',
  run(answers, tl) {
    return Promise.resolve('');
  }
}
}
*/
