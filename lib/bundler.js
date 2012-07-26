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
  helpers = require('./helpers'),
  defaultRepoListUrl = 'https://raw.github.com/blackjk3/jam/master/repos/repos.json',
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

bundler.refreshVendorFolder = function( vendorPath ) {
  wrench.rmdirSyncRecursive(vendorPath);
  fs.mkdirSync( vendorPath, 0755 );
};

bundler.bundle = function() {
  var packagePath = process.cwd() + '/package.json';
  
  helpers.readFile( packagePath, function( data ) {
    
    var packageData = JSON.parse(data).jam,
        repos = packageData.dependencies,
        vendorPath = packageData.vendorPath || 'js/vendor/';

    // Set override repo list
    if( packageData.jamSource ) {
      defaultRepoListUrl = packageData.jamSource;
    }

    bundler.getRepoList().then(function( repoList ) {
      bundler.processDependencies(repos, repoList.repositories, vendorPath);
    });
  });
};

bundler.processDependencies = function( repos, repoList, vendorPath) {

  // Refresh vendor
  bundler.refreshVendorFolder( vendorPath );
  
  // Process each dependency
  _.each(repos, function( repoItem , key ) {
    
    fs.exists(vendorPath + '/' + key + '.js', function(exists) {
      var url, path, currentRemoteRepo, versionStr, minExt, version;
      
      if(!exists) {
        if( repoList[key] ) {

          currentRemoteRepo = repoList[key];

          url = repoItem.minified ? currentRemoteRepo.min : currentRemoteRepo.url;
          minExt = repoItem.minified ? '.min' : '',

          path = root + '/' + vendorPath + '/';

          if( currentRemoteRepo.versioned ) {
            // Versioned ! :)
            
            if( !repoItem.version ) {
              
              // They did not specify a version in package.json ;(
              github.latestTag( currentRemoteRepo.github ).then(function ( version ) {
                url = url.replace('{version}', version);
                path += key + '-' + version + minExt + '.js';
                versionStr = ' (' + version + ')';

                bundler.download( url, path );
                sys.puts (" * Using " + key + versionStr);
              });
            } else {
              // Got a version.
              url = url.replace('{version}', repoItem.version);
              path += key + '-' + repoItem.version + minExt + '.js';
              versionStr = ' (' + repoItem.version + ')';

              bundler.download( url, path );
              sys.puts (" * Using " + key + versionStr);
            }
            
          } else {
            // Not versioned ;(
            path += key + minExt + '.js';
            versionStr = ' - does not version';
            
            bundler.download( url, path );
            sys.puts (" * Using " + key + versionStr);

          }
          
        } else {
          sys.puts (" * Could not find library " + key + '. Please add the path manually to package.json');
        }
      }
    });
  });
};

bundler.downloadVersionedHelper = function( url, path, version, key, minExt ) {

};

bundler.searchRepoList = function( key, repoList ) {
  
  if( repoList[key] ) {
    return repoList[key];
  }

  return false;
};

bundler.download = function( url, path ) {

  var parts = urlLib.parse(url),
      protocol = parts.protocol === 'https:' ? https : http;

  protocol.get(parts, function (response) {
    try {
      if ( response.statusCode === 200 ) {
        var writeStream = fs.createWriteStream( path );
        response.pipe( writeStream );
        
        writeStream.on('close', function () {});
      } else if ( response.statusCode === 404 ) {
        console.error("   * File not found:", url);
      }
    } catch (e) {
      console.error("* Error: Could not download file: ", url);
    }
  });
};

bundler.onRails = function() {
  var d = q.defer();

  fs.exists(process.cwd() + '/Gemfile', function ( exists ) {
    d.resolve(exists);
  });

  return d.promise;
};

bundler.add = function( key, min, optPath, version ) {
  
  bundler.getRepoList().then(function ( repoList ) {
    
    var results = bundler.searchRepoList( key, repoList.repositories );
    if( results ) {
      
      var url = min ? results.min : results.url,
          minExt = min ? '.min' : '',
          optPath = optPath ? optPath : '',
          path;
      
      if( results.versioned ) {
        
        // They version :) Let's find the lastest tag.
        if( version ) {

          url = url.replace('{version}', version);
          path = root + '/' + optPath + key + '-' + version + minExt + '.js';
        
          bundler.download( url, path );
          sys.puts(" * Downloading " + key + "-" + version + " to " + path);

        } else {
          github.latestTag( results.github ).then(function ( latestTag ) {
            
            url = url.replace('{version}', latestTag);
            path = root + '/' + optPath + key + '-' + latestTag + minExt + '.js';
          
            bundler.download( url, path );
            sys.puts(" * Downloading " + key + "-" + latestTag + " to " + path);
          
          });
        }
      } else {

        // Just grab whatever, they don't version. ;-(
        path = root + '/' + optPath + key + minExt + '.js';
        bundler.download( url, path );
        sys.puts(" * Library " + key + " does not version.");
        sys.puts(" * Downloading latest " + key + " to " + path);
      }
    } else {
      sys.puts (" * Could not find library " + key + '.  Please contact @itooamaneatguy to get this repo added.  Or submit a pull request to https://github.com/blackjk3/jam.');
    }
  });
};


module.exports = bundler;