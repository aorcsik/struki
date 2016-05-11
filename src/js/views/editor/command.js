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
        events: {
            "click .remove-command": "removeCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand"
        },

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

        removeCommand: function(e) {
            var cid = $(e.target).closest(".remove-command").closest("li").data("cid");
            if (cid == this.cid && window.confirm(Localization.gettext("Are you sure, you want to delete this command?", true))) {
                this.model.get("parent").removeCommand(this.model);
            }
        },

        editCommand: function(e) {
            if (e == this.cid || $(e.target).closest(".edit-command").closest("li").data("cid") == this.cid) {
                $(".editing").removeClass("editing");
                this.$el.addClass("editing");
                this.$el.find("#" + this.model.cid + "_code").select();
            }
        },

        saveCommand: function (e) {
            var cid = $(e.target).closest(".save-command").closest("li").data("cid");
            if (cid == this.cid) {
                this.model.set({
                    "code": this.$el.find("#" + this.model.cid + "_code").val(),
                    "_counter": this.model.get("_counter") ? this.model.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
        },

        render: function() {
            this.$el.data("cid", this.cid);
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
