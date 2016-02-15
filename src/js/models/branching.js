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
            this.set("branches", []);
            this.set("else_branch", new Branch({'condition': new Condition({'code': ""})}));
        },
        addBranch: function(branch) {
            this.get("branches").push(branch);
        }
    });
    return Branching;
});
