define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'text!../../../templates/editor/loop.html'
], function(require, $, _, Backbone, Localization, editorLoopTemplate) {
    var EditorLoopView = Backbone.View.extend({
        tagName: "li",
        className: "loop",
        loop_sequence: null,
        template: _.template(editorLoopTemplate),
        depth: 0,
        events: {
            "click .remove-command": "removeCommand",
            "click .add-command": "addCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand"
        },

        initialize: function() {
            var self = this;
            var EditorSequenceView = require('views/editor/sequence');
            this.loop_sequence = new EditorSequenceView({'model': this.model.get("sequence")});
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
            this.loop_sequence.close();
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },

        removeCommand: function(e) {
            var cid = $(e.target).closest(".remove-command").closest("li").data("cid");
            if (cid == this.cid && window.confirm(Localization.gettext("Are you sure, you want to delete this loop?", true))) {
                this.model.get("parent").removeCommand(this.model);
            }
        },

        editCommand: function(e) {
            var cid = $(e.target).closest(".edit-command").closest("li").data("cid");
            if (cid == this.cid) {
                $(".editing").removeClass("editing");
                this.$el.addClass("editing");
            }
        },

        saveCommand: function (e) {
            var cid = $(e.target).closest(".save-command").closest("li").data("cid");
            if (cid == this.cid) {
                this.model.set({
                    "condition": this.$el.find("#" + this.model.cid + "_condition").val(),
                    "test_after": this.$el.find("#" + this.model.cid + "_type").val() == 1,
                    "range": this.$el.find("#" + this.model.cid + "_type").val() == 2,
                    "_counter": this.model.get("_counter") ? this.model.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
        },

        addCommand: function(e) {
            var cid = $(e.target).closest(".add-command").closest("li").data("cid");
            if (cid == this.cid) {
                $(".command-dropdown").data("model", this.model).appendTo(this.$el.children(".command-line")).show();
            }
        },

        render: function(edit, only_command_line) {
            this.$el.data("cid", this.cid);
            this.$el.html(this.template({
                "L": Localization,
                "edit": edit,
                "depth": this.depth,
                "model": this.model
            }));
            this.$el.append(this.loop_sequence.$el);
            this.loop_sequence.setDepth(this.depth).render();
            this.$el.data("view", this);
            return this;
        }
    });
    return EditorLoopView;
});
