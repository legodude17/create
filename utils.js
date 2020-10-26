const { promises: fs } = require('fs');
const execa = require('execa');
const series = require('p-series');
const path = require('path');
const makeDir = require('make-dir');

const utils = module.exports = {
  writeFile: (place, contents) => fs.writeFile(utils.resolve(place), contents),

  format: obj => JSON.stringify(obj, null, 2),

  write: (place, obj) => utils.writeFile(place, utils.format(obj)),

  folder: name => {
    const arr = name.split('/');
    return arr[arr.length - 1];
  },

  mkdirp: (path, opts) => makeDir(utils.resolve(path), opts),

  path,
  execa,
  series,

  command(command, args, opts = {}) {
    if (!Array.isArray(args)) args = args.split(' ');
    opts.cwd = utils.cwd();
    return execa(command, args, opts);
  },

  _cwd: process.cwd(),
  cwd(dir) {
    if (dir) {
      utils._cwd = dir;
    }
    return utils._cwd;
  },

  resolve(...args) {
    return path.resolve(utils.cwd(), ...args);
  },

  async config(c) {
    const oldConfig = JSON.parse(await fs.readFileSync(utils.CONFIGFILE, 'utf8'));
    if (c == null) return oldConfig;
    const newConfig = Object.assign({}, oldConfig, c);
    await utils.write(utils.CONFIGFILE, newConfig);
    return newConfig;
  },

  CONFIGFILENAME: '.create-legodude.json'
};

utils.CONFIGFILE = path.join(process.env.HOME, utils.CONFIGFILENAME);
