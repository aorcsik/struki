define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/browser/command.html'
], function($, _, Backbone, commandTemplate) {
    var CommandBrowserView = Backbone.View.extend({
        tagName: "li",
        template: _.template(commandTemplate),
        depth: 0,

        initialize: function() {

        },
        onClose: function() {

        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function(edit) {
            this.$el.html(this.template({
                "edit": edit,
                "depth": this.depth,
                "model": this.model
            }));
            this.$el.data("view", this);
            return this;
        }
    });
    return CommandBrowserView;
});
