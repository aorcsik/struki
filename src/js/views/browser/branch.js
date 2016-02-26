define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/browser/branch.html'
], function(require, $, _, Backbone, branchTemplate){
    var BranchBrowserView = Backbone.View.extend({
        tagName: "li",
        className: "branch",
        branch_sequence: null,
        template: _.template(branchTemplate),
        type: 0,

        initialize: function() {
            var self = this;
            var SequenceBrowserView = require('views/browser/sequence');
            this.branch_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
            this.listenTo(this.model, "evaluate", function() {
                $(".evaluating").removeClass("evaluating");
                self.$el.children(".command-line").addClass("evaluating");
            });
        },
        onClose: function() {
            this.branch_sequence.close();
        },
        setBranchType: function(type) {
            this.type = type;
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
                    "branch": this.type,
                    "model": this.model
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "branch": this.type,
                    "model": this.model
                }));
                this.$el.append(this.branch_sequence.$el);
                this.branch_sequence.setDepth(this.depth).render();
                this.$el.data('view', this);
            }
            return this;
        }
    });
    return BranchBrowserView;
});
