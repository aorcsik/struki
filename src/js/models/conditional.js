define([
    'jquery',
    'underscore',
    'backbone',
    'models/branch'
], function($, _, Backbone, Branch) {
    var Conditional = Backbone.Model.extend({
        _type: "conditional",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("branches", []);
            this.newBranch();
            this.set("else_branch", new Branch({'parent': this, 'condition': ""}));
            this.listenTo(this.get("else_branch"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        newBranch: function(data) {
            var branch = new Branch($.extend({'parent': this}, data));
            this.addBranch(branch);
            return branch;
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
                'type': this._type,
                'branches': this.get("branches").map(function(branch) {
                    return branch.toJSON();
                }),
                'else_branch': this.get("else_branch").toJSON()
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this._type) {
                var else_branch = new Branch({'parent': this});
                else_branch.fromJSON(json.else_branch);
                this.set({
                    'branches': json.branches.map(function(branch_json) {
                        var branch = new Branch({'parent': this});
                        branch.fromJSON(branch_json);
                        return branch;
                    }),
                    'else_branch': else_branch
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluate: function(context) {
            for (var i = 0; i < this.get("branches").length; i++) {
                if (this.get("branches")[i].evaluateCondition(context)) {
                    return this.get("branches")[i].evaluate(context);
                }
            }
            this.get("else_branch").evaluateCondition(context);
            return this.get("else_branch").evaluate(context);
        }

    });
    return Conditional;
});
