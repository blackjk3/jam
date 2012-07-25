var q = require('q'),
  fs = require('fs'),
  sys = require('util'),
  path = require('path'),
  _ = require('underscore'),
  https = require('https'),
  http = require('http'),
  wrench = require('wrench'),
  urlLib = require('url'),
  defaultRepoListUrl = 'https://raw.github.com/blackjk3/jaws/master/repos/repos.json',
  defaultVendorPath = 'js/vendor/';

var bundler = {};

bundler.getRepoList = function() {
  var parts = urlLib.parse(defaultRepoListUrl),
      d = q.defer();

  https.get(parts, function (response) {

    try {
      if (response.statusCode === 200) {

        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end',function() {
          d.resolve(JSON.parse(data));
        });
      }
    } catch (e) {
      d.reject(e);
    }
  });

  return d.promise;
};

bundler.refreshVendorFolder = function() {
  wrench.rmdirSyncRecursive(vendorPath);
  fs.mkdirSync( vendorPath, 0755 );
};

bundler.bundle = function() {
  var packagePath = process.cwd() + '/package.json',
      repos;
  
  readFile( packagePath, function( data ) {
    repos = JSON.parse(data).jaws.dependencies;

    bundler.getRepoList().then(function( repoList ) {
      bundler.processDependencies(repos, repoList.repositories);
    });
  });
};

bundler.processDependencies = function( repos, repoList ) {

  // Refresh vendor
  bundler.refreshVendorFolder();

  _.each(repos, function(version, key) {
    path.exists(defaultVendorPath + key + '.js', function(exists) {
      var url, path;
      
      if(!exists) {
        if( repoList[key] ) {
          url = repoList[key].url.replace('{version}', version);
          path = repoList[key].versioned ? key + '-' + version + '.js' : key + '.js';
          bundler.download( url, defaultVendorPath + path, version, key );
        } else {
          sys.puts (" * Could not find library " + key + '. Please add the path manually to package.json');
        }
      }
    });
  });
};

bundler.searchRepoList = function( key, repoList ) {
  
  if( repoList[key] ) {
    return repoList[key];
  }

  return false;
};

bundler.download = function( url, path, version /* optional */, key /* optional */ ) {

  var parts = urlLib.parse(url),
      protocol = parts.protocol === 'https:' ? https : http,
      writeStream = fs.createWriteStream( path );

  protocol.get(parts, function (response) {
    try {
      if (response.statusCode === 200) {
        response.pipe( writeStream );

        writeStream.on('close', function () {
          if( key ) {
            var versionStr = version ? ' (' + version + ')' : '';
            sys.puts (" * Using " + key + versionStr);
          }
        });
      }
    } catch (e) {
      console.error("Could not download file: ", url);
    }
  });
},

module.exports = bundler;