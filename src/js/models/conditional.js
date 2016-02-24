define([
    'jquery',
    'underscore',
    'backbone',
    'models/branch'
], function($, _, Backbone, Branch) {
    var Conditional = Backbone.Model.extend({
        type: "conditional",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("branches", []);
            this.addBranch(new Branch());
            this.set("else_branch", new Branch({'condition': ""}));
            this.listenTo(this.get("else_branch"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        addBranch: function(branch, idx) {
            var self = this;
            if (idx === undefined || idx > this.get("branches").length) {
                this.get("branches").push(branch);
                this.trigger('change:add', branch, this.get("branches").length - 1);
            } else {
                this.get("branches").splice(idx, 0, branch);
                this.trigger('change:add', branch, idx);
            }
            this.trigger('change', this);
            this.listenTo(branch, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeBranch: function(branch) {
            var idx = this.get("branches").indexOf(branch);
            if (idx > -1) {
                var removed = this.get("branches").splice(idx, 1);
                this.trigger('change:remove', branch, idx);
                this.stopListening(removed[0]);
                this.trigger('change', this);
            }
        },
        toJSON: function() {
            return {
                'type': "conditional",
                'branches': this.get("branches").map(function(branch) {
                    return branch.toJSON();
                })
            };
        }
    });
    return Conditional;
});
