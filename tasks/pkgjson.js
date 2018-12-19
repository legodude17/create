const semver = require('semver');

module.exports = {
  questions: [
    {
      name: 'pkgjson',
      type: 'snippet',
      message: 'Fill out the fields in package.json:',
      fields: [
        {
          name: 'name'
        },
        {
          name: 'version',
          validate(value, state, item) {
            if (item && item.name === 'version' && !semver.valid(value)) {
              return 'version should be a valid semver value';
            }
            return true;
          },
          initial: '0.0.0'
        },
        {
          name: 'description',
          initial: 'my best package'
        },
        {
          name: 'username',
          initial: 'legodude17'
        },
        {
          name: 'author_name',
          message: 'Author Name',
          initial: 'JDB'
        },
        {
          name: 'license',
          initial: 'MIT'
        }
      ],
      template: `{
  "name": "\${name}",
  "description": "\${description}",
  "version": "\${version}",
  "homepage": "https://github.com/\${username}/\${name}",
  "author": "\${author_name} (https://github.com/\${username})",
  "repository": "\${username}/\${name}",
  "license": "\${license}"
}
`
    }
  ],
  task: {
    name: 'pkgjson',
    title: 'Create package.json',
    run(answers, tl, util) {
      return util.writeFile('package.json', answers.pkgjson.result)
        .then(() => `Created ${answers.folder}/package.json`);
    }
  }
};
