/**
 * @license Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * Author: Jason Kadrmas @itooamaneatguy
 */

/*jslint node: true, plusplus: true */
/*global define */

var fs = require('fs'),
    Path = require('path'),
    sys = require('util'),
    _ = require('underscore'),
    commands = {};

var viewHelpers = {
  capitalize: function( str ) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }
};

function raise ( error ) {
  sys.puts(error);
  process.exit();
}

commands = {

  jaws_root: '',
  root: '',

  /**
   * newProject
   * @return {[null]} [Creates a new project with directory and all]
   */

  newProject: function() {

    var dirs;

    project = arguments[0] || raise("Must supply a name for new project.");
    dirs = ["", "spec", "spec/jasmine", "spec/models", "spec/routers", "spec/views", "js", "js/app", "js/vendor", "js/app/views", "js/app/templates", "js/app/routers", "js/app/models", "js/app/helpers", "css", "spec/fixtures"];

    dirs.forEach(function(dir) {
      fs.mkdirSync( project + "/" + dir, 0755 );
    });

    sys.puts (" * Creating directory structure");

    var copyFile = function ( from, to ) {
      var ejs = fs.readFileSync(from).toString();
      
      fs.writeFileSync( Path.join(this.root, to), ejs );
      sys.puts(" * Created: " + to);
    };

    copyFile( this.jaws_root + "/templates/package.json", project + "/package.json" );
  },

  /**
   * newView
   * @return {[null]} [Creates a new view based on template]
   */
  
  newView: function() {
    var view = arguments[0] || this.raise("Must supply a name for the view");

    var data = { view: view };
    view = view.toLowerCase();
    sys.puts (" * Creating new view: " + view);

    var copyFile = function ( from, to ) {
      var ejs = fs.readFileSync(from).toString();
      
      _.extend( data, viewHelpers );
      fs.writeFileSync( Path.join( this.root, to), _.template(ejs, data) );
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

    copyFile( this.jaws_root + "/templates/views/backbone-view.js", "js/app/views/" + view + ".js" );
    copyFile( this.jaws_root + "/templates/templates/template.html", "js/app/templates/" + view + ".html" );
    copyFile( this.jaws_root + "/templates/helpers/helper.js", "js/app/helpers/" + view + "_helper.js" );
  },

  /**
   * newModel
   * @return {[null]} [Creates a new model based on template]
   */

  newModel: function() {
    var model = arguments[0] || raise("Must supply a name for the model");

    if ( !Path.existsSync("js/app/models/") ) {
      fs.mkdirSync( "js/app/models/", 0755 );
    }

    var copyFile = function ( from, to ) {
      var ejs = fs.readFileSync(from).toString();
      
      fs.writeFileSync( Path.join(this.root, to), _.template(ejs, model) );
      sys.puts(" * Created: " + to);
    };

    copyFile( this.jaws_root + "/templates/model/backbone-model.js", "js/app/model/" + model + ".js" );
  },

  /**
   * newRouter
   * @return {[null]} [Creates a new router based on template]
   */

  newRouter: function() {
    var router = arguments[0] || raise("Must supply a name for the router");

    if ( !Path.existsSync("js/app/routers/") ) {
      fs.mkdirSync( "js/app/routers/", 0755 );
    }

    var copyFile = function ( from, to ) {
      var ejs = fs.readFileSync(from).toString();
      
      fs.writeFileSync( Path.join(this.root, to), _.template(ejs, router) );
      sys.puts(" * Created: " + to);
    };

    copyFile( this.jaws_root + "/templates/routers/backbone-router.js", "js/app/routers/" + router + ".js" );
  }
};

module.exports = commands;