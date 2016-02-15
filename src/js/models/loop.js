define([
    'jquery',
    'underscore',
    'backbone',
    'models/condition',
    'models/sequence'
], function($, _, Backbone, Condition, Sequence) {
    var Loop = Backbone.Model.extend({
        type: "loop",
        defaults: {
            "condition": new Condition(),
            "test_after": false
        },
        initialize: function() {
            this.set("sequence", new Sequence());
        }
    });
    return Loop;
});
