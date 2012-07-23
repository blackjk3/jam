define(['text!templates/<%= view %>.html', 'helpers/<%= view %>_helper.js'], function ( template, helpers ) {

  var <%= capitalize(view) %>View = Backbone.View.extend({
    
    compiledTemplate: null,

    initialize: function() {
      // Precompile template
      this.compiledTemplate = _.template( template );
    },
      
    render: function() {
      var data = { name: 'Jaws' };
      this.$el.html( this.compiledTemplate( _.extend(data, helpers) ) );
    }

  });

  return <%= capitalize(view) %>View;
});