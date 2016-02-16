define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var ToolbarView = Backbone.View.extend({
        id: "toolbar",
        events: {},

        initialize: function() {
        },

        onClose: function() {},

        render: function() { this.$el.html("toolbar"); return this; }
    });
    return ToolbarView;
});
