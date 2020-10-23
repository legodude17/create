const readme = require('../plugins/readme');
const folder = require('../plugins/folder');
const git = require('../plugins/git');
const github = require('../plugins/github');
const gitignore = require('../plugins/gitignore');
const configFile = require('../plugins/configFile');

module.exports = {
  language: 'C#',
  type: 'RimWorld Mod',
  questions: [
    {
      name: 'author',
      type: 'input',
      message: 'What is your username?',
      initial: 'legodude17'
    },
    {
      name: 'versions',
      type: 'multiselect',
      message: 'What version(s) of RimWorld does it support?',
      choices: [
        '1.0',
        '1.1',
        '1.2'
      ]
    },
    {
      type: 'confirm',
      name: 'code',
      message: 'Does it use C#?',
      initial: true
    },
    {
      type: 'confirm',
      name: 'harmony',
      message: 'Does it use harmony?',
      initial: true,
      when: answers => answers.code,
      order: 1
    },
    {
      type: 'confirm',
      name: 'hugslib',
      message: 'Does it use HugsLib?',
      initial: false,
      when: answers => answers.code,
      order: 1
    }
  ],
  tasks: [
    {
      name: 'folders',
      title: 'Create folders',
      order: -1,
      run(answers, ll, util) {
        return Promise.all([
          'About',
          'Defs',
          'Patches',
          'Assemblies',
          answers.code && 'Source',
          'Textures',
          'Sounds'
        ].filter(Boolean).map(folder => {
          ll.addTask({ name: folder, title: `Create ${folder}` });
          return util.mkdirp(folder).then(() => ll[folder].complete(`Created ${folder}`));
        })).then(() => 'Created all top-level folders');
      }
    },
    {
      name: 'about',
      title: 'Create About.xml',
      run(answers, ll, util) {
        function dep(name, id, workshopId, download, indent) {
          return [
            '<li>',
            `  <packagedId>${id}</packageId>`,
            `  <displayName>${name}</displayName>`,
            workshopId && `  <steamWorkshopUrl>steam://url/CommunityFilePage/${workshopId}</steamWorkshopUrl>`,
            download && `  <downloadUrl>${download}</downloadUrl>`,
            '</li>'
          ].filter(Boolean).map(l => indent + l).join('\n');
        }
        const about = `${[
          '<?xml version="1.0" encoding="utf-8"?>',
          '<ModMetaData>',
          `  <name>${answers.name}</name>`,
          `  <author>${answers.author}</author>`,
          '  <supportedVersions>',
          ...answers.versions.map(version => `    <li>${version}</li>`),
          '  </supportedVersions>',
          `  <description>${answers.desc}</description>`,
          `  <packageId>${answers.author}.${answers.name}</packageId>`,
          '  <modDependencies>',
          answers.harmony && dep('Harmony', 'brrainz.harmony', '2009463077', 'https://github.com/pardeike/HarmonyRimWorld/releases/latest', '    '),
          answers.hugslib && dep('HugsLib', 'UnlimitedHugs.HugsLib', '818773962', null, '    '),
          '  </modDependencies>',
          '  <loadAfter>',
          '    <li>Ludeon.RimWorld</li>',
          '    <li>Ludeon.RimWorld.Royalty</li>',
          answers.harmony && '    <li>brrainz.harmony</li>',
          answers.hugslib && '    <li>UnlimitedHugs.HugsLib</li>',
          '  </loadAfter>',
          '</ModMetaData>'
        ].filter(Boolean).join('\n')}\n`;
        return util.writeFile('About/About.xml', about).then(() => 'Created About.xml');
      }
    },
    {
      name: 'log',
      title: 'Create log.txt',
      run(answers, ll, util) {
        return util.writeFile('log.txt', '').then(() => 'Created log.txt');
      }
    }
  ],
  plugins: [
    configFile(),
    folder(),
    readme(),
    github(),
    gitignore(['Assemblies', '.vscode', '.idea', 'obj', 'bin', 'log.txt']),
    git()
  ]
};
