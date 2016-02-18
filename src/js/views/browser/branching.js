define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/branch',
    'text!../../templates/browser/branching.html'
], function($, _, Backbone, BranchBrowserView, branchingTemplate){
    var BranchingBrowserView = Backbone.View.extend({
        tagName: "li",
        className: "branching",
        branches: null,
        else_branch: null,
        template: _.template(branchingTemplate),

        initialize: function() {
            var self = this;
            this.branches = this.model.get("branches").map(function(branch) {
                return new BranchBrowserView({'model': branch});
            });
            this.listenTo(this.model, "change:add", function(branch, idx) {
                self.branches.splice(idx, 0, new BranchBrowserView({'model': branch}));
            });
            this.listenTo(this.model, "change:remove", function(branch, idx) {
                self.branches.splice(idx, 1);
            });
            this.else_branch = new BranchBrowserView({'model': this.model.get("else_branch")});
        },
        onClose: function() {
            this.branches.forEach(function(branch) {
                branch.close();
            });
            this.else_branch.close();
        },

        render: function(depth) {
            this.$el.html(this.template({
                "model": this.model
            }));
            for (var i = 0; i < this.branches.length; i++) {
                this.$el.find(".branches").append(this.branches[i].$el);
                this.branches[i].render(depth, i);
            }
            this.$el.find(".branches").append(this.else_branch.$el);
            this.else_branch.render(depth, -1);
            this.$el.data("view", this);
            return this;
        }
    });
    return BranchingBrowserView;
});
