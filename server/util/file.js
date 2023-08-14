const fs = require('fs');
const path = require('path');

const clearImage = (filePath) => {
  const fileDist = path.join(__dirname, '..', filePath);
  fs.unlink(fileDist, (err) => {
    if (err) console.log(err);
  });
};

module.exports = {
  clearImage,
};
