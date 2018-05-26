#! /usr/bin/env node

const inquirer = require('inquirer');
const semver = require('semver');
const fs = require('fs');
const execa = require('execa');

const writeFile = (place, contents) => new Promise(((resolve, reject) => {
  fs.writeFile(place, contents, (err, res) => (err ? reject(err) : resolve(res)));
}));

const format = obj => JSON.stringify(obj, null, 2);

const write = (place, obj) => writeFile(place, format(obj));

const folder = name => {
  const arr = name.split('/');
  return arr[arr.length - 1];
};

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'What should it be called? ',
    validate(name) {
      if (encodeURIComponent(name) !== name) {
        return 'Name must not include URI-encodable characters';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'version',
    message: 'What version should it start at? ',
    default: '0.0.0',
    validate(name) {
      if (semver.valid(name) == null) {
        return 'Version must be valid semver';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'desc',
    message: 'What should the description be? ',
    default: 'My best package'
  },
  {
    type: 'input',
    name: 'username',
    message: 'What is your GitHub username? ',
    default: 'legodude17' // I am biased
  },
  {
    type: 'input',
    name: 'repo',
    message: 'What should the GitHub reponame be? ',
    default: hash => hash.name
  },
  {
    type: 'list',
    name: 'type',
    message: 'What type of project is this? ',
    choices: [
      'basic',
      'rollup',
      'parcel'
    ]
  },
  {
    type: 'confirm',
    name: 'babel',
    message: 'Use babel? ',
    when: hash => hash.type !== 'basic'
  },
  {
    type: 'confirm',
    name: 'react',
    message: 'Use react? ',
    when: hash => hash.type === 'parcel' && hash.babel
  },
  {
    type: 'input',
    name: 'entry',
    message: 'What is the entrypoint? ',
    default: hash => (hash.type === 'basic' ? 'index.js' : 'src/index.js')
  }
]).then(answers => new Promise((resolve, reject) =>
  fs.mkdir(folder(answers.name), err => {
    process.chdir(folder(answers.name));
    if (err) return reject(err);
    return resolve(answers);
  }))).then(answers => {
  const repoUrl = `https://github.com/${answers.username}/${answers.repo}`;
  const packageJson = {
    name: answers.name,
    version: answers.version,
    description: answers.desc,
    main: answers.entry,
    repository: {
      type: 'git',
      url: repoUrl
    },
    keywords: [],
    author: answers.username,
    license: 'MIT',
    bugs: {
      url: `${repoUrl}/issues`
    },
    homepage: `${repoUrl}#readme`
  };
  const eslintrc = {
    extends: 'airbnb-base',
    rules: {
      'no-multi-assign': 'off',
      'no-shadow': 'off',
      'no-return-assign': 1,
      'arrow-parens': 'off',
      'max-len': ['warn', { code: 120 }],
      'comma-dangle': ['error', 'never'],
      'no-restricted-syntax': ['error', 'WithStatement', "BinaryExpression[operator='in']"],
      indent: ['error', 2],
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off'
    }
  };
  const babelrc = {
    presets: ['env', answers.react && 'react'].filter(Boolean)
  };
  const rollup = `import resolve from 'rollup-plugin-node-resolve';
${answers.babel ? 'import babel from \'rollup-plugin-babel\';' : ''}

export default {
  input: ${answers.entry},
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  }
}`;

  return Promise.all([
    write('package.json', packageJson),
    write('.eslintrc', eslintrc),
    answers.babel && write('.babelrc', babelrc),
    (answers.type === 'rollup') && write('rollup.config.js', rollup)
  ].filter(Boolean)).then(() => answers);
}).then(answers => {
  const parcel = answers.type === 'parcel';
  const rollup = answers.type === 'rollup';
  const packages = [
    'eslint',
    `eslint-config-airbnb${answers.react ? '' : '-base'}`,
    'eslint-plugin-import',
    answers.react && 'eslint-plugin-react',
    answers.react && 'eslint-plugin-jsx-a11y',
    (answers.babel && !parcel) && '@babel/core',
    answers.babel && (parcel ? 'babel-preset-env' : '@babel/preset-env'),
    answers.react && (parcel ? 'babel-preset-react' : '@babel/preset-react'),
    rollup && 'rollup',
    rollup && 'rollup-plugin-node-resolve',
    (rollup && answers.babel) && 'rollup-plugin-babel',
    parcel && 'parcel-bundler'
  ].filter(Boolean);
  return execa.shell(`npm i -D ${packages.join(' ')}`);
})
  .then(() => console.log('Done!'))
  .catch(err => console.error(err.stack || err.message));
