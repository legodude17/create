function combineQuestions(questions) {
  const names = {};
  // eslint-disable-next-line no-return-assign
  for (const v of questions)
    Array.isArray(names[v.name])
      ? names[v.name].push(v)
      : (names[v.name] = [v]);
  return Object.keys(names).map(name => {
    const v = names[name];
    if (v.length === 1) return v[0];
    return {
      name: v[0].name,
      type: v[0].type,
      message: v[0].message,
      skip() {
        return v.every(z => !!z.skip && z.skip.call(this));
      },
      initial: v[0].initial
    };
  });
}

/*
type is:
{
  type: '',
  questions: [],
  tasks: [],
  plugins: []
}

*/

function sortByOrder(objs) {
  return objs.sort(({ order: a = 0 }, { order: b = 0 }) => a - b);
}

module.exports = async function run(types) {
  const answers = {};
  const { lang } = await enquirer.prompt({
    type: "select",
    name: "lang",
    message: "What language will this be in?",
    choices: [...new Set(types.map(type => type.language))]
  });
  answers.lang = lang;
  const { typeName } = await enquirer.prompt({
    type: "select",
    name: "typeName",
    message: "What type of project is this?",
    choices: types.filter(type => type.language === lang).map(type => type.type)
  });
  answers.type = typeName;
  const type = types.find(type => type.type === typeName);
  const questions = combineQuestions(
    sortByOrder(
      type.questions.concat(
        type.plugins.reduce((arr, plugin) => arr.concat(plugin.questions), [])
      )
    )
  );
  for (const q of questions) {
    if (!q.when || (await q.when(answers, utils))) {
      if (typeof q.initial === "function") {
        q.initial = await q.initial(answers, utils);
      }
      answers[q.name] = (await enquirer.prompt(q))[q.name];
    } else if (typeof q.initial === "function") {
      answers[q.name] = await q.initial(answers, utils);
    } else {
      answers[q.name] = q.initial;
    }
  }
  const tasks = sortByOrder(
    type.tasks.concat(
      type.plugins.reduce((arr, plugin) => arr.concat(plugin.tasks), [])
    )
  );
  ll.start();
  let tl = null;
  const state = { type, lang };
  for (const v of tasks) {
    try {
      if (!v.when || (await v.when(answers, utils))) {
        const show = v.show == undefined || v.show;
        if (show) {
          ll.addTask({ name: v.name, title: v.title });
          tl = ll[v.name];
        }
        const doneStr = await v.run(answers, tl, utils, state); // eslint-disable-line no-await-in-loop
        if (show) {
          tl.complete(doneStr);
          tl = null;
        }
      }
    } catch (error) {
      if (tl) {
        tl.error(error, false);
        ll.renderer.end(error);
        return;
      }
      throw new Error(`Task ${v.name} failed because ${error.toString()}`);
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
