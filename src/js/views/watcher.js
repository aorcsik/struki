define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/watcher.html'
], function($, _, Backbone, watcherTemplate){
    var WatcherView = Backbone.View.extend({
        id: "watcher",
        events: {},
        template: _.template(watcherTemplate),

        initialize: function() {
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return WatcherView;
});
