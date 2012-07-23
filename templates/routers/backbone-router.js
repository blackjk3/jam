define([], function () {

  var <%= capitalize(router) %>Router = Backbone.Router.extend({

    routes: {
      'index': 'index',
    
      // Default/ Base route
      '*actions': 'base'
    },

    initialize: function() {
      Backbone.history.start();
    },

    index: function() {
    
    },

    // Base route will default to index.
    base: function() {
      this.index();
    }

  });
  
  return <%= capitalize(router) %>Router;

});