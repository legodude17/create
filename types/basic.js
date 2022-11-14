const entry = require('../plugins/entry');
const eslint = require('../plugins/eslint');
const pkgjson = require('../plugins/pkgjson');
const git = require('../plugins/git');
const github = require('../plugins/github');
const gitignore = require('../plugins/gitignore');
const readme = require('../plugins/readme');
const folder = require('../plugins/folder');
const configFile = require('../plugins/configFile');
const npmInstall = require('../plugins/npmInstall');


module.exports = {
  language: 'JavaScript',
  type: 'basic',
  questions: [],
  tasks: [],
  plugins: [
    configFile(),
    npmInstall(),
    pkgjson(),
    folder(),
    eslint(),
    entry('index.js'),
    readme(),
    github(),
    gitignore(['node_modules']),
    git()
  ]
};
