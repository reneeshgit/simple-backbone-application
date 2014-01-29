
/**
 ***************************************
 * Array Storage Driver
 * used to store our views
 ***************************************
 */
var ArrayStorage = function(){
  this.storage = {};
};
ArrayStorage.prototype.get = function(key)
{
  return this.storage[key];
};
ArrayStorage.prototype.set = function(key, val)
{
  return this.storage[key] = val;
};
/**
 ***************************************
 * Base View
 ***************************************
 */
var BaseView = Backbone.View.extend({
 
  /**
   * Set our storage driver
   */
  templateDriver: new ArrayStorage,
 
  /**
   * Set the base path for where our views are located
   */
  viewPath: 'views/',
 
  /**
   * Get the template, and apply the variables
   */
  template: function()
  {
    var view, data, template, self;
 
    switch(arguments.length)
    {
      case 1:
        view = this.view;
        data = arguments[0];
        break;
      case 2:
        view = arguments[0];
        data = arguments[1];
        break;
    }
 
    template = this.getTemplate(view, false);
    self = this;
 
    return template(data, function(partial)
    {
      return self.getTemplate(partial, true);
    });
  },
 
  /**
   * Facade that will help us abstract our storage engine,
   * should we ever want to swap to something like LocalStorage
   */
  getTemplate: function(view, isPartial)
  {
    return this.templateDriver.get(view) || this.fetch(view, isPartial);
  },
 
  /**
   * Facade that will help us abstract our storage engine,
   * should we ever want to swap to something like LocalStorage
   */
  setTemplate: function(name, template)
  {
    return this.templateDriver.set(name, template);
  },
 
  /**
   * Function to retrieve the template via ajax
   */
  fetch: function(view, isPartial)
  {
    var markup = $.ajax({
      async: false,
 
      //the URL of our template, we can optionally use dot notation
      url: this.viewPath + view.split('.').join('/') + '.mustache'
    }).responseText;
 
    return isPartial
      ? markup
      : this.setTemplate(view, Mustache.compile(markup));
  }
});

$(document).ready(function() {
	var BlogRouter = Backbone.Router.extend({
	routes: {
		"": "index",
	},
	initialize: function(options)
	{
		this.customer = options.customer;
	},
	index: function()
	{
		this.customer.render();
	},

	});
	
	var cus_collection = new CustomerCollection();
	
	var CustomerApp = new CustomerMain({
			el       : $('#main_content'),
			collection   : cus_collection,
		});
	
	
	var router = new BlogRouter({
		customer : CustomerApp,
	});
	
		
	Backbone.history.start({pushState: true, root: "/backboneapp/"})
});