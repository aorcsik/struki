define([
    'jquery',
    'underscore',
    'backbone',
    'models/function_wrapper'
], function($, _, Backbone, FunctionWrapper) {
    var Context = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            this.set("variables", $.extend({}, this.get("variables")));
            this.set("functions", $.extend({
                "print": new FunctionWrapper({'function': function() { console.log.apply(this, arguments); }})
            }, this.get("functions")));
        },
        getVariable: function(name) {
            return this.get("variables")[name];
        },
        setVariable: function(name, value) {
            var variables = this.get("variables");
            variables[name] = value;
            this.set({
                "variables": variables,
                "updated_at": (new Date()).getTime()
            });
        },
        unsetVariable: function(name) {
            var variables = this.get("variables");
            delete variables[name];
            this.set({
                "variables": variables,
                "updated_at": (new Date()).getTime()
            });
        },
        incrementVariable: function(name, step) {
            var variables = this.get("variables");
            variables[name] = variables[name] + (step || 1);
            this.set({
                "variables": variables,
                "updated_at": (new Date()).getTime()
            });
        },
        decrementVariable: function(name, step) {
            this.incrementVariable(name, -1 * step);
        },
        evaluateCondition: function(condition) {
            console.log("evaluate condition: " + condition);
            return false;
        },
        evaluateCode: function(code) {
            console.log("evaluate code: " + code);
            return null;
        },
        evaluateRange: function() {
            console.log("evaluate range: " + condition);
            var name, start, end;
            return {
                'var': "i",
                'start': start,
                'end': end,
                'step': start > end ? -1 : 1
            };
        }
    });
    return Context;
});
