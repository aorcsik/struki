define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Condition = Backbone.Model.extend({
        defaults: {
            "code": "I"
        }
    });
    return Condition;
});
