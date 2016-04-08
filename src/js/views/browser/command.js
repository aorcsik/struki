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
            var self = this;
            this.listenTo(this.model, "debugstop", function() {
                $("#browser .error").removeClass("error");
                $("#browser .evaluating").removeClass("evaluating");
                self.$el.children(".command-line").addClass("evaluating");
            });
            this.listenTo(this.model, "errorstop", function() {
                $("#browser .error").removeClass("error");
                $("#browser .evaluating").removeClass("evaluating");
                self.$el.children(".command-line").addClass("error");
            });
        },
        onClose: function() {

        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function(edit, only_command_line) {
            if (only_command_line) {
                this.$el.children("form").remove();
                this.$el.children(".command-line").replaceWith(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "model": this.model
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "model": this.model
                }));
                this.$el.data("view", this);
            }
            return this;
        }
    });
    return CommandBrowserView;
});
