define([
    'jquery',
    'underscore',
    'backbone',
    'models/document/branch'
], function($, _, Backbone, Branch) {
    var Conditional = Backbone.Model.extend({
        _type: "conditional",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set({
                "branches": [],
                "else_branch": new Branch({'parent': this, 'condition': ""})
            });
            this.listenTo(this.get("else_branch"), 'change', function(e) {
                self.trigger('change', e);
            });
            this.newBranch();
        },
        newBranch: function(data) {
            var branch = new Branch($.extend({'parent': this}, data));
            this.addBranch(branch);
            return branch;
        },
        addBranch: function(branch, idx) {
            var self = this,
                branches = this.get("branches").map(function(branch) { return branch; });
            if (idx === undefined || idx > branches.length) {
                idx = branches.length;
                branches.push(branch);
            } else {
                branches.splice(idx, 0, branch);
            }
            this.trigger('change:add', branch, idx);
            this.set({'branches': branches});
            this.listenTo(branch, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeBranch: function(branch) {
            this.removeBranchByIndex(this.get("branches").indexOf(branch));
        },
        removeBranchByIndex: function(idx) {
            var branches = this.get("branches").map(function(branch) { return branch; });
            if (idx > -1 && idx < branches.length) {
                var removed = branches.splice(idx, 1);
                this.trigger('change:remove', removed[0], idx);
                this.stopListening(removed[0]);
                this.set({'branches': branches});
            }
        },
        serialize: function() {
            return {
                'type': this._type,
                'branches': this.get("branches").map(function(branch) {
                    return branch.serialize();
                }),
                'else_branch': this.get("else_branch").serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var else_branch = new Branch({'parent': this});
                else_branch.deserialize(json.else_branch);
                this.set({
                    'branches': [],
                    'else_branch': else_branch
                });
                this.listenTo(this.get("else_branch"), 'change', function(e) {
                    self.trigger('change', e);
                });
                json.branches.forEach(function(branch_json) {
                    var branch = new Branch({'parent': self});
                    branch.deserialize(branch_json);
                    self.addBranch(branch);
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluate: function(context) {
            var result;
            for (var i = 0; i < this.get("branches").length; i++) {
                result = this.get("branches")[i].evaluate(context);
                if (result.condition === true) {
                    return result.result;
                }
            }
            return this.get("else_branch").evaluate(context).result;
        }

    });
    return Conditional;
});
