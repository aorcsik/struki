define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/toolbar.html'
], function($, _, Backbone, toolbarTemplate){
    var ToolbarView = Backbone.View.extend({
        id: "toolbar",
        className: "navbar navbar-inverse",
        events: {},
        template: _.template(toolbarTemplate),

        initialize: function() {
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return ToolbarView;
});
