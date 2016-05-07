define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'text!../../../templates/editor/branch.html'
], function(require, $, _, Backbone, Localization, editorBranchTemplate){
    var EditorBranchView = Backbone.View.extend({
        tagName: "li",
        className: "branch",
        branch_sequence: null,
        template: _.template(editorBranchTemplate),
        branch_type: 0,
        events: {
            "click .remove-command": "removeCommand",
            "click .add-command": "addCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand"
        },

        initialize: function() {
            var self = this;
            var EditorSequenceView = require('views/editor/sequence');
            this.branch_sequence = new EditorSequenceView({'model': this.model.get("sequence")});
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
            this.branch_sequence.close();
        },
        setBranchType: function(branch_type) {
            this.branch_type = branch_type;
            return this;
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },

        removeCommand: function(e) {
            var cid = $(e.target).closest(".remove-command").closest("li").data("cid");
            if (cid == this.cid) {
                var conditional = this.model.get("parent");
                if (conditional.get("branches").length > 1 && window.confirm(Localization.gettext("Are you sure, you want to delete this branch?", true))) {
                    conditional.removeBranch(this.model);
                } else if (window.confirm(Localization.gettext("Are you sure, you want to delete this branch and the conditional?", true))) {
                    conditional.get("parent").removeCommand(conditional);
                }
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
                "depth": this.depth,
                "branch": this.branch_type,
                "model": this.model,
                "L": Localization
            }));
            this.$el.append(this.branch_sequence.$el);
            this.branch_sequence.setDepth(this.depth).render();
            this.$el.data('view', this);
            return this;
        }
    });
    return EditorBranchView;
});
