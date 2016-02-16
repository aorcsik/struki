define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var PropertiesView = Backbone.View.extend({
        id: "properties",
        events: {},

        initialize: function() {
        },

        onClose: function() {},

        render: function() { this.$el.html("properties"); return this; }
    });
    return PropertiesView;
});
