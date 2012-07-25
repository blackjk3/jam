var q = require('q'),
  fs = require('fs'),
  sys = require('util'),
  path = require('path'),
  _ = require('underscore'),
  https = require('https'),
  http = require('http'),
  wrench = require('wrench'),
  urlLib = require('url'),
  github = require('./github'),
  defaultRepoListUrl = 'https://raw.github.com/blackjk3/jam/master/repos/repos.json',
  defaultVendorPath = 'js/vendor/',
  root = process.cwd();

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
};

bundler.onRails = function() {
  var d = q.defer();

  path.exists(process.cwd() + '/Gemfile', function(exists) {
    d.resolve(exists);
  });

  return d.promise;
};

bundler.add = function( key, min, optPath ) {
  
  bundler.getRepoList().then(function(repoList) {
    
    var results = bundler.searchRepoList( key, repoList.repositories );
    if( results ) {
      if( results.versioned ) {
        github.latestTag( results.github ).then(function ( lastestTag ) {
          
          var url = min ? results.min : results.url,
              minExt = min ? '.min' : '',
              path = results.versioned ? key + '-' + lastestTag + minExt + '.js' : key + minExt + '.js';
          
          url = url.replace('{version}', lastestTag);
          path = root + '/' + optPath + path;

          bundler.download( url, path );
          sys.puts(" * Downloading " + key + " to " + path);
        
        });
      }
    } else {
      sys.puts (" * Could not find library " + key + '.  Please contact @itooamaneatguy to get this repo added.  Or submit a pull request to https://github.com/blackjk3/jaws.');
    }
  });
};


module.exports = bundler;