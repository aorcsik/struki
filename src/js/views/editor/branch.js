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
        render: function(edit, only_command_line) {
            if (only_command_line) {
                this.$el.children("form").remove();
                this.$el.children(".command-line").replaceWith(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "branch": this.branch_type,
                    "model": this.model,
                    "L": Localization
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "branch": this.branch_type,
                    "model": this.model,
                    "L": Localization
                }));
                this.$el.append(this.branch_sequence.$el);
                this.branch_sequence.setDepth(this.depth).render();
                this.$el.data('view', this);
            }
            return this;
        }
    });
    return EditorBranchView;
});
