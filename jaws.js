var fs    = require('fs'),
  sys = require('util'),
  path = require('path'),
  cssom = require('cssom'),
  jsdom = require('jsdom'),
  async = require('async'),
  https = require('https'),
  http = require('http'),
  urlLib = require('url'),
  events = require('events'),
  wrench = require('wrench'),
  eventEmitter = new events.EventEmitter(),
  _     = require('underscore'),
  commands = require('./lib/commands'),
  jaws_root = __dirname,
  root = process.cwd(),
  vendorPath = "js/vendor/";

commands.root = root;
commands.jaws_root = __dirname;

//
// private helpers
//
function readFile( path, cb ) {
    fs.readFile(path, function(err, data) {
      if(err) {
        console.error("Could not open file: ", path);
        process.exit(1);
      } else {
        cb( data.toString('utf8'));
      }
    });
}

function downloadBundle( url, path, key, version ) {
  var self = this;
  var parts = urlLib.parse(url);
  var protocol = parts.protocol === 'https:' ? https : http;
  var writeStream = fs.createWriteStream( path );

  protocol.get(parts, function (response) {
    try {
      if (response.statusCode === 200) {
        response.pipe( writeStream );

        writeStream.on('close', function () {
          var versionStr = version ? ' (' + version + ')' : '';
          sys.puts (" * Using " + key + versionStr);
        });
      }
    } catch (e) {
      console.error("Could not download file: ", url);
    }
  });
}

function getRepositories() {
  var url = 'https://raw.github.com/blackjk3/jaws/master/repos/repos.json';
  var self = this;
  //var writeStream = fs.createWriteStream( 'js/vendor/testing.js' );
  var parts = urlLib.parse(url);

  https.get(parts, function (response) {

    try {
      if (response.statusCode === 200) {

        var data = '';

        response.on('data', function (chunk){
            data += chunk;
        });

        response.on('end',function(){
            var obj = JSON.parse(data);
            eventEmitter.emit('repo', obj);
        });
      }
    } catch (e) {
      // d.reject(e);
    }
  });
}

function bundle() {
  var packagePath = process.cwd() + '/package.json',
      repos;

  readFile( packagePath, function( data ) {
    repos = JSON.parse(data).jaws.dependencies;
    getRepositories();
  });

  eventEmitter.on('repo', function( repoList ) {
    var repoJSON = repoList.repositories;
    processDependencies(repos, repoJSON);
  });
}

function refreshVendorFolder() {
  wrench.rmdirSyncRecursive(vendorPath);
  fs.mkdirSync( vendorPath, 0755 );
}

function processDependencies( repos, repoList ) {

  // Refresh vendor
  refreshVendorFolder();

  _.each(repos, function(version, key) {
    path.exists(vendorPath + key + '.js', function(exists) {
      var url, path;
      
      if(!exists) {
        if( repoList[key] ) {
          url = repoList[key].url.replace('{version}', version);
          path = repoList[key].versioned ? key + '-' + version + '.js' : key + '.js';
          downloadBundle( url, vendorPath + path, key, version );
        } else {
          sys.puts (" * Could not find library " + key + '. Please add the path manually to package.json');
        }
      }
    });
  });
}

/**
 * watchProject()
 * @return {[null]} [Creates a new view based on template]
 */

function watchProject() {

}

//
// the public api
//
module.exports = {
  cli: function() {
        var program = require('commander');

        program
          .version('0.0.1')
          .description('Generates new projects, views, models, etc.  Makes build web apps not so damn hard!@')
    
          .option('new, --new <name>', 'Generates a new project.')
          .option('g, --generate <framework>:<type> <name>', 'Generates a new model or view.')
          .option('watch, --watch <path>', 'Watches project for recompile changes.')
          .option('bundle, --bundle', 'Updates dependencies based on package.json file.')
          .parse(process.argv);
        
        if ( process.argv.length === 2 ) {
            sys.puts('Try running --help for all the options.');
        }
        else {
          
          if ( program.new ) {
            commands.newProject( program.new );
          }
          else if ( program.generate ) {
            if ( program.generate === 'view' ) {
              commands.newView( program.args[0] );
            } else if ( program.generate === 'model' ) {
              commands.newModel( program.args[0] );
            }
          }
          else if ( program.watch ) {
            watchProject();
          }
          else if ( program.bundle ) {
            bundle();
          }
        }
    }
  // end of exports
}