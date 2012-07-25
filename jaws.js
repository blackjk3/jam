var q = require('q'),
  fs = require('fs'),
  sys = require('util'),
  path = require('path'),
  async = require('async'),
  commands = require('./lib/commands'),
  github = require('./lib/github'),
  bundler = require('./lib/bundler'),
  jaws_root = __dirname,
  root = process.cwd();

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

// function download( url, path ) {
//   var parts = urlLib.parse(url);
//   var protocol = parts.protocol === 'https:' ? https : http;
//   var writeStream = fs.createWriteStream( path );

//   protocol.get(parts, function (response) {
//     try {
//       if (response.statusCode === 200) {
//         response.pipe( writeStream );

//         writeStream.on('close', function () {
//           var versionStr = version ? ' (' + version + ')' : '';
//           sys.puts (" * Added to " + key + versionStr);
//         });
//       }
//     } catch (e) {
//       console.error("Could not download file: ", url);
//     }
//   });
// }

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
          .option('add, --add', 'Adds a dependency into the current directory.')
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
            bundler.bundle();
          }
          else if ( program.add ) {
            var key = program.args[0];

            bundler.getRepoList().then(function(repoList) {
              var results = bundler.searchRepoList( key, repoList.repositories );
              if( results ) {
                if( results.versioned ) {
                  github.latestTag( results.github ).then(function (lastestTag) {
                    var url = results.url.replace('{version}', lastestTag),
                        path = results.versioned ? key + '-' + lastestTag + '.js' : key + '.js';
                    
                    bundler.download( url, root + '/' + path );
                    sys.puts(" Downloading " + key + " to " + root);
                  });
                }
              } else {
                sys.puts (" * Could not find library " + key + '.  Please contact @itooamaneatguy to get this repo added.  Or submit a pull request to https://github.com/blackjk3/jaws.');
              }
            });
          }
        }
    }
  // end of exports
}