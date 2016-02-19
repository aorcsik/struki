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

        initialize: function() {
            var SequenceBrowserView = require('views/browser/sequence');
            this.branch_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
        },
        onClose: function() {
            this.branch_sequence.close();
        },

        render: function(depth, branch) {
            this.$el.html(this.template({
                "depth": depth,
                "branch": branch,
                "model": this.model
            }));
            this.$el.append(this.branch_sequence.$el);
            this.branch_sequence.render(depth);
            this.$el.data('view', this);
            return this;
        }
    });
    return BranchBrowserView;
});
