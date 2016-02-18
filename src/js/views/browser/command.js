define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/browser/command.html'
], function($, _, Backbone, commandTemplate) {
    var CommandBrowserView = Backbone.View.extend({
        tagName: "li",
        template: _.template(commandTemplate),

        initialize: function() {

        },
        onClose: function() {},

        render: function(depth) {
            this.$el.html(this.template({
                "depth": depth,
                "model": this.model
            }));
            this.$el.data("view", this);
            return this;
        }
    });
    return CommandBrowserView;
});
