var notifications = new Backbone.Collection();

//----------------------------------------------------------------------------------------

var NotificationView = BaseView.extend({
  el: $('#notifications'),
  view: '_notification',
  initialize: function()
  {
    this.listenTo(notifications, 'add', this.render);
  },
  render: function(notification)
  {
    var $message = $( this.template(notification.toJSON()) );
    this.$el.append($message);
    this.delayedHide($message);
  },
  delayedHide: function($message)
  {
    var timeout = setTimeout(function()
    {
      $message.fadeOut(function()
      {
        $message.remove();
      });
    }, 5*1000);
 
    var self = this;
    $message.hover(
      function()
      {
        timeout = clearTimeout(timeout);
      },
      function()
      {
        self.delayedHide($message);
      }
    );
  }
});
var notificationView = new NotificationView();

