const fs = require('fs');

const utils = module.exports = {
  writeFile: (place, contents) => new Promise(((resolve, reject) => {
    fs.writeFile(place, contents, (err, res) => (err ? reject(err) : resolve(res)));
  })),

  format: obj => JSON.stringify(obj, null, 2),

  write: (place, obj) => utils.writeFile(place, utils.format(obj)),

  folder: name => {
    const arr = name.split('/');
    return arr[arr.length - 1];
  }
};
