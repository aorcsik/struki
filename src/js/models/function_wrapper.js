define([
    'backbone',
    'interfaces/callable'
], function(Backbone, Callable) {
    var FunctionWrapper = Backbone.Model.extend(Callable).extend({
        _type: "function_wrapper",
        defaults: {},

        getFunc: function() {
            return this.get("func");
        },

        call: function(context, parameters) {
            return this.getFunc().apply(context, parameters);
        }
    });
    return FunctionWrapper;
});
