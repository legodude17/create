const enquirer = require('@legodude/enquirer');
const ll = require('listr-log');
const makeTyper = require('./typer');
const utils = require('./utils');

function combineQuestions(questions) {
  const names = {};
  // eslint-disable-next-line no-return-assign
  questions.forEach(v => (Array.isArray(names[v.name]) ?
    names[v.name].push(v) :
    (names[v.name] = [v])));
  return Object.keys(names).map((name) => {
    const v = names[name];
    if (v.length === 1) return v[0];
    return {
      name: v[0].name,
      type: v[0].type,
      message: v[0].message,
      skip() { return v.every(z => !!z.skip && z.skip.call(this)); },
      initial: v[0].initial
    };
  });
}

module.exports = async function run(plugins, types, opts = {}) {
  const typer = makeTyper(types);
  const questions = combineQuestions(plugins
    .reduce((arr, plugin) => arr.concat(plugin.questions), [])
    .concat(typer.questions));
  const answers = await enquirer.prompt(questions);
  const tasks = plugins.map(plugin => plugin.task).concat(typer.tasks).filter(Boolean).sort((a, b) => {
    if (a.order && b.order) return a.order - b.order;
    if (a.order) return -a.order;
    if (b.order) return b.order;
    return 0;
  });
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
        console.error(`Task ${v.name} failed because ${e.toString()}`);
        return;
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
