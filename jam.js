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
          .option('-m, --minified', 'Get minified version from add.')
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

            var optPath = '',
                min = program.minified ?  true : false;
            
            bundler.onRails().then(function( rails ) {
              if ( rails ) {
                program.confirm('Detected rails. Do you want to put file in vendor/assets/javascripts? ', function( ok ) {
                  
                  if ( ok ) {
                    optPath = 'vendor/assets/javascripts/';
                  }
                  
                  bundler.add( program.args[0], min, optPath );
                  process.stdin.destroy();
                });
              } else {
                bundler.add( program.args[0], min );
              }
            });
          }
        }
    }
  // end of exports
}