const run = require('./run');
const folder = require('./tasks/folder');
const pkgjson = require('./tasks/pkgjson');
const github = require('./tasks/github');
const git = require('./tasks/git');
const gitignore = require('./tasks/gitignore');
const readme = require('./tasks/readme');
const basic = require('./types/basic');
const rollup = require('./types/rollup');
const parcel = require('./types/parcel');

run([pkgjson, folder, gitignore, git, github, readme], [basic, rollup, parcel])
  .catch(console.error)
  .then(() => process.exit());
