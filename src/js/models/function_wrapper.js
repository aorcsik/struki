define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var FunctionWrapper = Backbone.Model.extend({
        _type: "function_wrapper",
        defaults: {},
        initialize: function() {},
        evaluate: function(parameters, context) {
            return this.get("func").apply(this, parameters);
        }
    });
    return FunctionWrapper;
});
