define([
    'jquery',
    'underscore',
    'backbone',
    'models/branch',
    'models/condition'
], function($, _, Backbone, Branch, Condition) {
    var Branching = Backbone.Model.extend({
        type: "branching",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("branches", [new Branch()]);
            this.set("else_branch", new Branch({'condition': new Condition({'code': ""})}));
            this.listenTo(this.get("else_branch"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        addBranch: function(branch, idx) {
            var self = this;
            if (idx === undefined || idx > this.get("branches").length) {
                this.get("branches").push(command);
                this.trigger('change:add', command, this.get("branches").length - 1);
            } else {
                this.get("branches").splice(idx, 0, command);
                this.trigger('change:add', command, idx);
            }
            // this.trigger('change', this);
            this.listenTo(branch, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeBranch: function(branch) {
            var idx = this.get("branches").indexOf(branch);
            if (idx > -1) {
                this.get("branches").splice(idx, 1);
                this.trigger('change:remove', branch, idx);
                this.stopListening(removed[0]);
                // this.trigger('change', this);
            }
        }
    });
    return Branching;
});
