define([
    'jquery',
    'underscore',
    'backbone',
    'views/editor/branch',
    'text!../../../templates/editor/conditional.html'
], function($, _, Backbone, EditorBranchView, editorConditionalTemplate){
    var EditorConditionalView = Backbone.View.extend({
        tagName: "li",
        className: "conditional",
        branches: null,
        else_branch: null,
        template: _.template(editorConditionalTemplate),
        depth: 0,

        initialize: function() {
            var self = this;
            this.branches = this.model.getBranches().map(function(branch) {
                var branch_view = new EditorBranchView({'model': branch});
                self.listenTo(branch_view, "highlight", function(e) {
                    self.trigger("highlight", e);
                });
                return branch_view;
            });
            this.else_branch = new EditorBranchView({'model': this.model.getElseBranch()});
        },
        onClose: function() {
            this.branches.forEach(function(branch) {
                branch.close();
            });
            this.else_branch.close();
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function() {
            this.$el.html(this.template({
                "model": this.model
            }));
            for (var i = 0; i < this.branches.length; i++) {
                this.$el.children(".branches").append(this.branches[i].$el);
                this.branches[i].setDepth(this.depth).setBranchType(i).render();
            }
            this.$el.children(".branches").append(this.else_branch.$el);
            this.else_branch.setDepth(this.depth).setBranchType(-1).render();
            this.$el.data("view", this);
            return this;
        }
    });
    return EditorConditionalView;
});
