/* global __dirname, process */

var fs = require('fs');

const modulesDir = `${__dirname}/../../modules`;

fs.mkdir(modulesDir, onDir);

function onDir(error) {
  handleError(error);

  fs.copyFile(
    modulesDir,
    `${__dirname}/modules/envelope-follower.js`,
    handleError
  );
}

function handleError(error) {
  if (error) {
    console.error(error);
    process.exit(-1);
  }
}
