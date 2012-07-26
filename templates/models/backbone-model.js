 define([], function () {
  
  var <%= capitalize(model) %>Model = Backbone.Model.extend({
    // Add model logic
  });

  return <%= capitalize(model) %>Model;
});
