/* global __dirname, process */

var fs = require('fs-extra');

const modulesDir = `${__dirname}/../../modules`;

fs.ensureDir(modulesDir, onDir);

function onDir(error) {
  handleError(error);

  fs.copy(`${__dirname}/modules/envelope-follower.js`, modulesDir, handleError);
}

function handleError(error) {
  if (error) {
    console.error(error);
    process.exit(-1);
  }
}
