define([
    'jquery',
    'underscore',
    'backbone',
    'models/condition',
    'models/sequence'
], function($, _, Backbone, Condition, Sequence) {
    var Branch = Backbone.Model.extend({
        defaults: {
            "condition": new Condition()
        },
        initialize: function() {
            this.set("sequence", new Sequence());
        }
    });
    return Branch;
});
