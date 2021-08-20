/* global __dirname, process */

var fs = require('fs');

const modulesDir = `${__dirname}/../../modules`;

if (fs.existsSync(modulesDir)) {
  copyFile();
} else {
  fs.mkdir(modulesDir, onDir);
}

function onDir(error) {
  handleError(error);
  copyFile();
}

function copyFile() {
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
