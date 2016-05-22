define([
    'models/document/abstract_list_element',
    'models/document/branch'
], function(AbstractListElement, Branch) {
    var Conditional = AbstractListElement.extend({
        _type: "conditional",
        defaults: {},
        initialize: function() {
            var self = this,
                else_branch = new Branch({'parent': this, 'condition': ""});
            this.listenTo(else_branch, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({
                "else_branch": else_branch,
                "list": []
            });
            this.addBranch();
        },

        getElseBranch: function() {
            return this.get("else_branch");
        },
        getBranches: function() {
            return this.getListItems();
        },

        addBranch: function(branch, _new, idx) {
            if (branch && branch._type === "branch") {
                branch.set({'parent': this});
            } else {
                branch = new Branch($.extend({'parent': this}, branch));
                branch._new = _new === undefined ? true : _new;
            }
            this.addListItem(branch, idx);
            return branch;
        },
        removeBranch: function(branch) {
            return this.removeListItem(branch);
        },

        /** Serializable */
        serialize: function() {
            return {
                'type': this._type,
                'branches': this.getBranches().map(function(branch) { return branch.serialize(); }),
                'else_branch': this.getElseBranch().serialize()
            };
        },
        deserialize: function(json) {
            if (json.type && json.type === this._type) {
                var self = this,
                    else_branch = new Branch({'parent': this});
                else_branch.deserialize(json.else_branch);
                this.listenTo(else_branch, 'change', function(e) {
                    self.trigger('change', e);
                });
                this.set({
                    'else_branch': else_branch,
                    'list': []
                });
                json.branches.forEach(function(branch_json) {
                    var branch = new Branch({'parent': self});
                    branch.deserialize(branch_json);
                    self.addBranch(branch);
                });
            }
        },

        /** Evaluable */
        evaluate: function(context) {
            var result,
                branches = this.getBranches();
            for (var i = 0; i < branches.length; i++) {
                result = branches[i].evaluate(context);
                if (result.condition === true) {
                    return result.result;
                }
            }
            return this.getElseBranch().evaluate(context).result;
        }

    });
    return Conditional;
});
