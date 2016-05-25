define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'interfaces/editable',
    'text!../../../templates/editor/branch.html'
], function(require, $, _, Backbone, Localization, Editable, editorBranchTemplate){
    var EditorBranchView = Backbone.View.extend(Editable).extend({
        tagName: "li",
        className: "branch",
        branch_sequence: null,
        template: _.template(editorBranchTemplate),
        branch_type: 0,
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
            this.branch_sequence = new EditorSequenceView({'model': this.model.get("sequence")});
            this.listenTo(this.branch_sequence, "highlight", function(e) {
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
            var conditional = this.model.get("parent");
            if (conditional.getBranches().length > 1 && window.confirm(Localization.gettext("Are you sure, you want to delete this branch?", true))) {
                conditional.removeBranch(this.model);
            } else if (window.confirm(Localization.gettext("Are you sure, you want to delete this branch and the conditional?", true))) {
                conditional.get("parent").removeCommand(conditional);
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
                "depth": this.depth,
                "branch": this.branch_type,
                "model": this.model,
                "L": Localization
            }));
            this.$el.append(this.branch_sequence.$el);
            this.branch_sequence.setDepth(this.depth).render();
            this.$el.data('view', this);

            this.$el.removeClass("editing");
            if (this.model._new) {
                this.editCommand(this.cid);
                this.model._new = false;
            }
            return this;
        }
    });
    return EditorBranchView;
});
