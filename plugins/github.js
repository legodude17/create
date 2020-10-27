const GitHub = require('github-api');
const { setState } = require('../helpers');

const isGithub = answers => answers.github;

module.exports = () => ({
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
      initial(answers) {
        if (answers.pkgjson && answers.pkgjson.values.repo) return answers.pkgjson.values.repo;
        if (answers.pkgjson && answers.pkgjson.values.name) return answers.pkgjson.values.name;
        if (answers.folder) return answers.folder;
        if (answers.name) return answers.name;
        return '';
      },
      when: isGithub
    },
    {
      type: 'input',
      name: 'ghdesc',
      message: 'What is the repo description?',
      initial(answers) {
        if (answers.pkgjson && answers.pkgjson.values.description) return answers.pkgjson.values.description;
        if (answers.desc) return answers.desc;
        if (answers.name) return answers.name;
        if (answers.folder) return answers.folder;
        return '';
      },
      when: isGithub
    },
    {
      type: 'input',
      name: 'username',
      message: 'What is your GitHub username?',
      initial(answers) {
        if (answers.pkgjson && answers.pkgjson.username) return answers.pkgjson.username;
        return 'legodude17'; // Yes, I'm biased
      },
      when: isGithub
    },
    {
      type: 'invisible',
      name: 'ghtoken',
      message: 'Generate a GitHub personal access token, then enter here:',
      async when(answers, util) {
        return answers.github && (await util.config()).ghtoken == null;
      },
      async initial(answers, util) {
        return (await util.config()).ghtoken;
      }
    },
    {
      type: 'confirm',
      name: 'saveghtoken',
      message: 'Save GH Token?',
      async when(answers, util) {
        return answers.github && (await util.config()).ghtoken != null;
      },
      initial: false
    }
  ],
  tasks: [
    {
      name: 'repo',
      title: 'Create GitHub repo',
      when: isGithub,
      run(answers) {
        const gh = new GitHub({
          token: answers.ghtoken
        });
        const user = gh.getUser(answers.username);
        return user.createRepo({
          name: answers.repo,
          description: answers.ghdesc
        }).then(() => `Created repo ${answers.username}/${answers.repo}`);
      }
    },
    {
      name: 'savetoken',
      title: 'Save access token',
      when: answers => answers.github && answers.saveghtoken,
      async run(answers, ll, util) {
        await util.config({ ghtoken: answers.ghtoken });
        return `Wrote to ${util.CONFIGFILENAME}`;
      }
    },
    setState({ github: true }, isGithub)
  ]
});
