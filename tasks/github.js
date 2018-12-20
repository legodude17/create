const GitHub = require('github-api');

module.exports = {
  questions: [
    {
      type: 'confirm',
      message: 'Create GitHub repo?',
      name: 'github',
      initial: true
    },
    {
      type: 'input',
      name: 'repo',
      message: 'What is the repo name?',
      initial(input) {
        const hash = input.state.answers;
        if (hash.pkgjson && hash.pkgjson.values.repo) return hash.pkgjson.values.repo;
        if (hash.pkgjson && hash.pkgjson.values.name) return hash.pkgjson.values.name;
        if (hash.folder) return hash.folder;
        if (hash.name) return hash.name;
        return '';
      },
      skip: arg => (typeof arg === 'string' ? false : !arg.answers.github)
    },
    {
      type: 'input',
      name: 'ghdesc',
      message: 'What is the repo description?',
      initial(input) {
        const hash = input.state.answers;
        if (hash.pkgjson && hash.pkgjson.values.description) return hash.pkgjson.values.description;
        if (hash.folder) return hash.folder;
        if (hash.name) return hash.name;
        return '';
      },
      skip: arg => (typeof arg === 'string' ? false : !arg.answers.github)
    },
    {
      type: 'input',
      name: 'username',
      message: 'What is your GitHub username?',
      initial(input) {
        const hash = input.state.answers;
        if (hash.pkgjson && hash.pkgjson.username) return hash.pkgjson.username;
        return 'legodude17';
      },
      skip: arg => (typeof arg === 'string' ? false : !arg.answers.github)
    },
    {
      type: 'password',
      name: 'ghpass',
      message: 'What is your GitHub password?',
      skip: arg => (typeof arg === 'string' ? false : !arg.answers.github)
    }
  ],
  task: {
    name: 'repo',
    title: 'Create GitHub repo',
    when: answers => answers.github,
    run(answers) {
      const gh = new GitHub({
        username: answers.username,
        password: answers.ghpass
      });
      const user = gh.getUser(answers.username);
      return user.createRepo({
        name: answers.repo,
        description: answers.ghdesc
      }).then(() => `Created repo ${answers.username}/${answers.repo}`);
    }
  }
};