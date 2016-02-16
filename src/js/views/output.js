define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var OutputView = Backbone.View.extend({
        id: "output",
        events: {},

        initialize: function() {
        },

        onClose: function() {},

        render: function() { this.$el.html("output"); return this; }
    });
    return OutputView;
});
