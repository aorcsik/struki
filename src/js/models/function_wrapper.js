define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var FunctionWrapper = Backbone.Model.extend({
        defaults: {},
        initialize: function() {},
        evaluate: function(parameters, context) {
            return this.get("function").apply(this, parameters);
        }
    });
    return FunctionWrapper;
});
