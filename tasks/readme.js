module.exports = {
  name: 'readme',
  title: 'Create readme',
  run(answers, tl, utils) {
    const readme = `# ${answers.name}
> ${answers.desc}`;
    return utils.writeFile('readme.md', readme).then(() => 'Wrote to readme.md');
  }
};
