define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'text!../../../templates/editor/command.html'
], function($, _, Backbone, Localization, editorCommandTemplate) {
    var EditorCommandView = Backbone.View.extend({
        tagName: "li",
        template: _.template(editorCommandTemplate),
        depth: 0,

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "debugstop", function() {
                self.$el.closest(".struktogram").find(".error").removeClass("error");
                self.$el.closest(".struktogram").find(".evaluating").removeClass("evaluating");
                self.$el.children(".command-line").addClass("evaluating");
            });
            this.listenTo(this.model, "errorstop", function() {
                self.$el.closest(".struktogram").find(".error").removeClass("error");
                self.$el.closest(".struktogram").find(".evaluating").removeClass("evaluating");
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
                    "model": this.model,
                    "L": Localization
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "model": this.model,
                    "L": Localization
                }));
                this.$el.data("view", this);
            }
            return this;
        }
    });
    return EditorCommandView;
});
