#! /usr/bin/env node
/*eslint-disable*/

const inquirer = require('inquirer');
const semver = require('semver');
const fs = require('fs');
const execa = require('execa');
const ll = require('listr-log');
const mdir = require('make-dir');
const path = require('path');
const GitHub = require('github-api');
const series = require('p-series');

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
      if (name === '') return 'Name must not be empty';
      if (encodeURIComponent(name) !== name) return 'Name must not include URI-encodable characters';
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
      'parcel',
      'electron'
    ]
  },
  {
    type: 'confirm',
    name: 'babel',
    message: 'Use babel? ',
    when: hash => hash.type === 'rollup' || hash.type === 'parcel'
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
    default: hash => ((hash.type === 'basic' || hash.type === 'electron') ? 'index.js' : 'src/index.js')
  },
  {
    type: 'confirm',
    name: 'github',
    message: 'Create github repo? '
  },
  {
    type: 'password',
    name: 'ghpass',
    message: 'What is your GitHub password? ',
    when: hash => hash.github
  }
]).then(answers => new Promise((resolve, reject) => {
  ll.make = `Create folder ${folder(answers.name)}`;
  ll.start();
  fs.mkdir(folder(answers.name), err => {
    process.chdir(folder(answers.name));
    if (err) return reject(err);
    return resolve(answers);
  });
}))
  .catch(err => ll.make.error(err, true))
  .then(answers => {
    ll.make.complete(`Created folder ${folder(answers.name)}`);
    ll.write = 'Write files';
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
    const rollup = [
      'import resolve from \'rollup-plugin-node-resolve\';',
      answers.babel && 'import babel from \'rollup-plugin-babel\';',
      'export default {',
      `input: '${answers.entry.replace(/ /g, '')}',`,
      'output: {',
      'file: \'dist/bundle.js\',',
      'format: \'cjs\'',
      '},',
      'plugins: [',
      'resolve(),',
      answers.babel && 'babel()',
      ']',
      '}'
    ].filter(Boolean).join('\n');

    const gitignore = [
      'node_modules/',
      answers.type !== 'basic' && 'dist/',
      answers.type === 'parcel' && '.cache/'
    ].filter(Boolean).join('\n');

    const readme = `# ${answers.name}
> ${answers.desc}`;
    if (answers.type === 'electron') {
      eslintrc.env = {
        browser: true,
        node: true
      };
      packageJson.scripts = {
        run: 'electron .',
        dev: 'electron . --debug'
      };
    }

    [
      'package.json',
      '.eslintrc',
      '.gitignore',
      'readme.md',
      answers.babel && '.babelrc',
      (answers.type === 'rollup') && 'rollup.config.js'
    ].filter(Boolean)
      .forEach(file => ll.write.addTask({ name: file, title: `Write ${file}` }));

    const files = [
      write('package.json', packageJson),
      write('.eslintrc', eslintrc),
      writeFile('.gitignore', gitignore),
      writeFile('readme.md', readme),
      answers.babel && write('.babelrc', babelrc),
      (answers.type === 'rollup') && writeFile('rollup.config.js', rollup)
    ].filter(Boolean);

    return Promise.all(files).then(() => answers);
  })
  .catch(err => ll.write.error(err, true))
  .then(answers => {
    ll.write.complete('Wrote files');
    ll.src = 'Create entrypoint';
    ll.src.addTask({ title: 'Create folder', name: 'folder' });
    return mdir(path.dirname(answers.entry)).then(() => answers);
  })
  .catch(err => (ll.src.folder ? ll.src.folder.error(err, true) : Promise.reject(err)))
  .then(answers => {
    ll.src.folder.complete(`Created folder ${path.dirname(answers.entry)}`);
    ll.src.addTask({ title: 'Create file', name: 'file' });
    return writeFile(answers.entry, '// ENTRYPOINT').then(() => answers);
  })
  .catch(err => (ll.src.file ? ll.src.file.error(err, true) : ll.src.error(err, true)))
  .then(answers => {
    ll.src.file.complete(`Wrote ${path.basename(answers.entry)}`);
    ll.src.complete('Created entrypoint');
    if (answers.type !== 'electron') return answers;
    ll.electron = 'Create files for electron';
    const indexJs = [
      "const { app, BrowserWindow } = require('electron'); // eslint-disable-line",
      "const path = require('path');",
      "const debug = process.argv[2].includes('debug');",
      'function makeWindow() {',
      '  const opts = {',
      '    width: 100,',
      '    height: 100,',
      '    title: app.getName()',
      '  };',
      '  const window = new BrowserWindow(opts);',
      "  window.loadFile(path.join(__dirname, 'index.html'));",
      '  if (debug) {',
      '    window.webContents.openDevTools();',
      '    window.maximize();',
      "    require('devtron').install(); // eslint-disable-line",
      '  }',
      '}',
      "app.on('ready', makeWindow);",
      "app.on('window-all-closed', () => app.quit());"
    ].join('\n');

    const indexHTML = [
      '<!DOCTYPE html>',
      '<html lang="en" dir="ltr">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <link rel="stylesheet" href="main.css">',
      `  <title>${answers.name}</title>`,
      '</head>',
      '<body>',
      '  <script>',
      "    require('./renderer.js');",
      '  </script>',
      '</body>',
      '</html>'
    ].join('\n');

    [
      'index.html',
      'index.js',
      'renderer.js',
      'main.css'
    ].forEach(v => ll.electron.addTask({ title: `Write ${v}`, name: v }));

    return Promise.all([
      writeFile('index.html', indexHTML),
      writeFile('index.js', indexJs),
      writeFile('renderer.js', ''),
      writeFile('main.css', '')
    ]).then(() => answers);
  })
  .catch(err => ll.electron.error(err, true))
  .then(answers => {
    if (answers.type === 'electron') ll.electron.complete('Wrote Electron files');
    if (!answers.github) return answers;
    ll.github = 'Create github repo';
    const gh = new GitHub({
      username: answers.username,
      password: answers.ghpass
    });
    const user = gh.getUser(answers.username);
    return user.createRepo({
      name: answers.name,
      description: answers.desc
    }).then(() => answers);
  })
  .catch(err => ll.github.error(err, true))
  .then(answers => {
    if (answers.github) ll.github.complete(`Created ${answers.username}/${answers.name}`);
    ll.npm = 'Install npm packages';
    const parcel = answers.type === 'parcel';
    const rollup = answers.type === 'rollup';
    const electron = answers.type === 'electron';
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
      (rollup && answers.babel) && 'rollup-plugin-babel@beta',
      parcel && 'parcel-bundler',
      electron && 'electron',
      electron && 'devtron'
    ].filter(Boolean);
    packages.forEach(pkg => ll.npm.addTask({ name: pkg, title: `Install ${pkg}` }));
    return Promise.all(packages
      .map(pkg => execa.shell(`npm i -D ${pkg}`))
      .map((prom, i) =>
        prom.then(() => ll.npm[packages[i]].complete('Installed'))))
      .then(() => answers);
  })
  .catch(err => ll.npm.error(err, true))
  .then(answers => {
    ll.npm.complete('Packages installed');
    ll.git = 'Init Git';
    const commands = [
      'git init',
      'git add .',
      'git commit -m "init"'
    ];
    if (answers.github) {
      commands.push(`git remote add origin https://github.com/${answers.username}/${answers.repo}`);
      commands.push('git push -u origin master');
    }
    commands.forEach((v, i) => ll.git.addTask({ name: i, title: v }));
    const proms = commands.map((v, i) => () =>
      execa.shell(v)
        .then(() => ll.git[i].complete('Ran command')));
    return series(proms).then(() => answers);
  })
  .catch(err => ll.git.error(err, true))
  .then(() => ll.git.complete('Git init complete'))
  .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
