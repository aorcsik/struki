define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var WatcherView = Backbone.View.extend({
        id: "watcher",
        events: {},

        initialize: function() {
        },

        onClose: function() {},

        render: function() { this.$el.html("watcher"); return this; }
    });
    return WatcherView;
});
