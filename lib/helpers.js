var fs = require('fs'),
    helpers = {};

helpers.readFile = function ( path, cb ) {
  fs.readFile(path, function(err, data) {
    if(err) {
      console.error("Could not open file: ", path);
      process.exit(1);
    } else {
      cb( data.toString('utf8'));
    }
  });
};

module.exports = helpers;