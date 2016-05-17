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
            this.listenTo(this.loop_sequence, "highlight", function(e) {
                self.trigger("highlight", e);
            });
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
            this.loop_sequence.close();
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },

        removeCommand: function(e) {
            if (window.confirm(Localization.gettext("Are you sure, you want to delete this loop?", true))) {
                this.model.get("parent").removeCommand(this.model);
            }
            return false;
        },

        editCommand: function(e) {
            $(".editing").removeClass("editing");
            this.$el.addClass("editing");
            this.$el.find("#" + this.model.cid + "_condition").select();
            return false;
        },

        saveCommand: function (e) {
            this.model.set({
                "condition": this.$el.find("#" + this.model.cid + "_condition").val(),
                "test_after": this.$el.find("#" + this.model.cid + "_type").val() == 1,
                "range": this.$el.find("#" + this.model.cid + "_type").val() == 2,
                "_counter": this.model.get("_counter") ? this.model.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
            return false;
        },

        addCommand: function(e) {
            $(".command-dropdown").data("model", this.model).appendTo(this.$el.children(".command-line")).show();
            return false;
        },

        render: function() {
            this.$el.html(this.template({
                "L": Localization,
                "depth": this.depth,
                "model": this.model
            }));
            this.$el.append(this.loop_sequence.$el);
            this.loop_sequence.setDepth(this.depth).render();
            this.$el.data("view", this);

            this.$el.removeClass("editing");
            if (this.model._new) {
                this.editCommand(this.cid);
                this.model._new = false;
            }
            return this;
        }
    });
    return EditorLoopView;
});
