var apiUrl = 'http://192.168.0.251/laravela/public/';

// customer collection
var CustomerCollection = Backbone.Collection.extend({
	url: apiUrl +'api/v2/customers',
	comparator: 'first_name',
});

//customer partial view. for displyaing each customer details in the customer listing
var CustomerPartial = BaseView.extend({
	view :'customers._customer',
	tagName: "tr",
	render: function()
  	{
		this.$el.html(this.template(this.model.attributes) );
		return this;

  	},
});

//Customer listing page
var CustomerMain = BaseView.extend({
  //define our template location
  view: 'customers.index',
  customerEditView:null,
  page:1,
  perPage:2,
  initialize: function()
  {
 	this.fetching = this.collection.fetch();
  },

	 //events this view should subscribe to
  events: {
	//when click on submit button this function will invoke
    'submit #Customer_create': function(e)
    {
      e.preventDefault();
      e.stopPropagation();
 
      return this.addCustomer( $(e.target).serialize() );
    },

	// when click on delete link, this function will invoke
	'click #delete_Customer':function(e)
	{
		e.preventDefault();
      	e.stopPropagation();

		cus_id = e.target.getAttribute('value');
		var self = this;
		var model = this.collection.get(cus_id);

		model.destroy({wait: true, success: function(model,response,options) {

			self.$el.html('');
			self.$el.html(self.template({}) );
			perpage = self.page * self.perPage;
			//this code is for listing the customers with the current number of pages loaded.
			self.pagination(1,perpage);
			notifications.add({
				type: 'success',
				message: 'Customer Deleted!'
			});
		}
		});
		
	},

	//when click on edit link of the customers list this function will invoke
	'click #edit_Customer': function(e)
    {
		e.preventDefault();
		e.stopPropagation();


		var id = e.target.getAttribute('value');

		var self = this;
		if(!self.customerEditView) {
			self.customerEditView = new CustomerEditView({
				el : $('#main_content'),
				collection: self.collection,
				mainObj:self,
			});
		}
		
		self.customerEditView.render(id);
		
	
    },
	'click #pager':function(e)
	{
		this.page = this.page+1;
		this.pagination();
	},

	'click #add_customer':function(e)
	{
		this.showAddCustomer();
	},
  },

  pagination:function(page = this.page,perPage = this.perPage){
		var customers = this.collection.rest((page-1)*perPage);
        customers = _.first(customers, perPage);
		for(var i in customers){
			this.showOneCustomer(customers[i]);
		}
		if(customers.length>0)
		$('#paging').html(' <a id="pager">Load More</a> ');
		else
			$('#paging').html('No more results found');
		
  },

	//this function is for rendering the customers list
  render: function()
  {
   
	var self = this;
	this.fetching.done(function(e)
    	{
			self.$el.html('');
			self.$el.html(self.template({}) );
			self.pagination();			
		});
  },


	// sub function of render function for showing each customer row
	showOneCustomer: function(model){
		var customerPartial = new CustomerPartial({
			model:model,
		});
		$('#customers').append( customerPartial.render().el );

		
	},


	//function for showing the add customer page
	showAddCustomer: function(){
		
		var self = this;
		if(!self.CustomerAddView) {
			self.CustomerAddView = new CustomerAdd({
				collection:this.collection,
				el: self.el,
				mainObj:self,
			});
		}
		self.CustomerAddView.render();
	},

	

});

// View for the customer add page
var CustomerAdd = BaseView.extend({
	

	view: 'customers.create',
	mainObj:null,
	initialize: function(options){
		this.mainObj = options.mainObj;
	},

	events: {
    
		'submit #frm_add_Customer': function(e)
		{
			e.preventDefault();
			e.stopPropagation();
		
			return this.saveCustomer( $(e.target).serialize() );
		},
		'click #list_customer':function(e){
			this.mainObj.render();
		},
		
	},
	//fuction for saving customer details to database
	saveCustomer: function(formData){

		var
		self = this,	
		action = apiUrl +'api/v2/customers'
		;
	
		//submit a post to our api
		$.post(action, formData, function(Customer, status, xhr)
		{

			self.collection.add(Customer);

			self.$('#frm_add_Customer')[0].reset();

			self.mainObj.render();
			notifications.add({
				type: 'success',
				message: 'Customer Added!'
			});
			
		}).fail(function(jqXHR, textStatus, errorThrown){

			var err = $.parseJSON(jqXHR.responseText);
			
			notifications.add({
				type: 'error',
				message: err.err_msg
			});
		});
	
	},

	//for rendering the customer add page
	render: function()
	{
		this.$el.html(this.template({}));
		
	},



});

// view for the customer edit page
var CustomerEditView = BaseView.extend({

	view: 'customers.edit',
	mainObj:null,

	initialize:function(options){
		this.mainObj = options.mainObj;
	},

	events: {

	'click #list_customer':function(e){
			this.mainObj.render();
		},
    
	// this function is invoked when click on save button from edit customer page
	'submit #frm_edit_Customer': function(e)
    {
		e.preventDefault();
		e.stopPropagation();
		self = this;
 
      	var id = $('#id').val();

		formData = $(e.target).serializeArray();

		var newData = {}

		for(var i in formData)
			newData[formData[i].name] = formData[i].value;

		var model = this.collection.get(id);

		model.save(newData,{
			success: function(model, response, options) {

				self.mainObj.render();

				notifications.add({
					type: 'success',
					message: 'Customer updated!'
				});
			}, 
			error: function(model, xhr, options) {

				var err = $.parseJSON(xhr.responseText);
			
				notifications.add({
					type: 'error',
					message: err.err_msg
				});
			}
		});		

    }
	
  },

	// for rendering the customer edit page
	render: function(id)
	{
		
		var row = this.collection.get(id).attributes;

		this.$el.html('');
		if(row.newsletter_status==1)
			row.newsletter_checked = 'checked=true';
		else
			row.newsletter_checked = '';

		if(row.account_status==1)
			row.account_status_active = 'selected="selected"';
		else
			row.account_status_inactive = 'selected="selected"';

		this.$el.html(this.template({customer:row}));
		
	},

});