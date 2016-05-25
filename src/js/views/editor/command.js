define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'interfaces/editable',
    'text!../../../templates/editor/command.html'
], function($, _, Backbone, Localization, Editable, editorCommandTemplate) {
    var EditorCommandView = Backbone.View.extend(Editable).extend({
        tagName: "li",
        template: _.template(editorCommandTemplate),
        depth: 0,
        events: {
            "click .remove-command": "removeCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand"
        },

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "debugstop", function() {
                self.$el.children(".command-line").addClass("highlight-evaluating");
                self.trigger("highlight", self);
            });
            this.listenTo(this.model, "errorstop", function() {
                self.$el.children(".command-line").addClass("highlight-error");
                self.trigger("highlight", self);
            });
        },
        onClose: function() {

        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },

        removeCommand: function(e) {
            if (window.confirm(Localization.gettext("Are you sure, you want to delete this command?", true))) {
                this.model.get("parent").removeCommand(this.model);
            }
            return false;
        },

        editCommand: function(e) {
            $(".editing").removeClass("editing");
            this.$el.addClass("editing");
            this.$el.find("#" + this.model.cid + "_code").select();
            return false;
        },

        saveCommand: function (e) {
            this.model.set({
                "code": this.$el.find("#" + this.model.cid + "_code").val(),
                "_counter": this.model.get("_counter") ? this.model.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
            return false;
        },

        addCommand: function(e) {
            return false;
        },

        render: function() {
            this.$el.html(this.template({
                "depth": this.depth,
                "model": this.model,
                "L": Localization
            }));
            this.$el.data("view", this);

            this.$el.removeClass("editing");
            if (this.model._new) {
                this.editCommand(this.cid);
                this.model._new = false;
            }
            return this;
        }
    });
    return EditorCommandView;
});
