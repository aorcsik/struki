define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var BrowserView = Backbone.View.extend({
        id: "browser",
        events: {},

        initialize: function() {
        },

        onClose: function() {},

        render: function() { this.$el.html("browser"); return this; }
    });
    return BrowserView;
});
