define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Condition = Backbone.Model.extend({
        defaults: {
            "code": "I",
            "test_after": false
        }
    });
    return Condition;
});
