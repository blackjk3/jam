var fs    = require('fs'),
  sys = require('util'),
  Path = require('path'),
  cssom = require('cssom'),
  jsdom = require('jsdom'),
  async = require('async'),
  _     = require('underscore'),
  jaws_root = __dirname,
  root = process.cwd();

var viewHelpers = {
  capitalize: function( str ) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }
};

//
// private helpers
//
function readFile( path, cb ) {
    fs.readFile(path, function(err, data) {
        if (err) cb(err)
        else cb(null, data.toString('utf8'))
    })
}

// function getViewFramework( f ) {

//   if ( f === 'backbone' ) {
//      Load backbone template
    
//   }

// }

function raise ( error ) {
  sys.puts(error);
  process.exit();
}

/**
 * newProject
 * @return {[null]} [Creates a new project with directory and all]
 */

function newProject () {

  var dirs;

  project = arguments[0] || raise("Must supply a name for new project.");
  dirs = ["", "spec", "spec/jasmine", "spec/models", "spec/routers", "spec/views", "js", "js/app", "js/app/vendor", "js/app/views", "js/app/templates", "js/app/routers", "js/app/models", "js/app/helpers", "css", "spec/fixtures"];

  dirs.forEach(function(dir) {
    fs.mkdirSync( project + "/" + dir, 0755 );
  });

  sys.puts (" * Creating directory structure");
}

/**
 * newView
 * @return {[null]} [Creates a new view based on template]
 */

function newView() {
  var view = arguments[0] || raise("Must supply a name for the view");

  var data = { view: view };
  view = view.toLowerCase();
  sys.puts (" * Creating new view: " + view);

  var copyFile = function ( from, to ) {
    var ejs = fs.readFileSync(from).toString();
    
    _.extend( data, viewHelpers );
    fs.writeFileSync( Path.join(root, to), _.template(ejs, data) );
    sys.puts(" * Created: " + to);
  };
  
  if ( !Path.existsSync("js/app/views/") ) {
    fs.mkdirSync( "js/app/views/", 0755 );
  }

  if ( !Path.existsSync("js/app/templates/") ) {
    fs.mkdirSync( "js/app/templates/", 0755 );
  }

  if ( !Path.existsSync("js/app/helpers/") ) {
    fs.mkdirSync( "js/app/helpers/", 0755 );
  }

  copyFile( jaws_root + "/templates/views/backbone-view.js", "js/app/views/" + view + ".js" );
  copyFile( jaws_root + "/templates/templates/template.html", "js/app/templates/" + view + ".html" );
  copyFile( jaws_root + "/templates/helpers/helper.js", "js/app/helpers/" + view + "_helper.js" );
}

/**
 * newModel
 * @return {[null]} [Creates a new model based on template]
 */

function newModel() {
  var model = arguments[0] || raise("Must supply a name for the model");

  if ( !Path.existsSync("js/app/models/") ) {
    fs.mkdirSync( "js/app/models/", 0755 );
  }

  var copyFile = function ( from, to ) {
    var ejs = fs.readFileSync(from).toString();
    
    fs.writeFileSync( Path.join(root, to), _.template(ejs, model) );
    sys.puts(" * Created: " + to);
  };

  copyFile( jaws_root + "/templates/model/backbone-model.js", "js/app/model/" + model + ".js" );
}

function newRouter() {
  var router = arguments[0] || raise("Must supply a name for the router");

  if ( !Path.existsSync("js/app/routers/") ) {
    fs.mkdirSync( "js/app/routers/", 0755 );
  }

  var copyFile = function ( from, to ) {
    var ejs = fs.readFileSync(from).toString();
    
    fs.writeFileSync( Path.join(root, to), _.template(ejs, router) );
    sys.puts(" * Created: " + to);
  };

  copyFile( jaws_root + "/templates/routers/backbone-router.js", "js/app/routers/" + router + ".js" );
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
          .parse(process.argv);
        
        if ( process.argv.length === 2 ) {
            sys.puts('Try running --help for all the options.');
        }
        else {
          
          if ( program.new ) {
            newProject( program.new );
          }
          else if ( program.generate ) {
            //var framework = getViewFramework( program.framework );
            if ( program.generate === 'view' ) {
              newView( program.args[0] );
            } else if ( program.generate === 'model' ) {
              newModel( program.args[0] );
            }
          }
          else if ( program.watch ) {
            watchProject();
          }
        }
    }
  // end of exports
}