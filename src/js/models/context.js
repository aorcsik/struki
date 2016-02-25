define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'models/function_wrapper'
], function($, _, Backbone, Parser, FunctionWrapper) {
    var Context = Backbone.Model.extend({
        defaults: {
            "_state": 0
        },
        initialize: function() {
            this.set("variables", $.extend({}, this.get("variables")));
            this.set("functions", $.extend({
                "print": new FunctionWrapper({'function': function() { console.log.apply(this, arguments); }})
            }, this.get("functions")));
        },
        stepState: function() {
            this.set({"_state": this.get("_state") ? this.get("_state") + 1 : 1});
            if (this.get('_debug') && this.get('_state') === this.get('_debug')) {
                throw "DEBUG STOP";
            }
        },
        getVariable: function(name) {
            if (this.get("variables")[name] !== undefined) return this.get("variables")[name];
            else throw "Compile Error: undefined variable '" + name + "'";
        },
        setVariable: function(name, value) {
            var variables = this.get("variables");

            if (variables[name] !== undefined) variables[name] = value;
            else throw "Compile Error: undefined variable '" + name + "'";
            this.set({
                "variables": variables,
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
        },
        unsetVariable: function(name) {
            var variables = this.get("variables");
            delete variables[name];
            this.set({
                "variables": variables,
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
        },
        incrementVariable: function(name, step) {
            var variables = this.get("variables");
            variables[name] = variables[name] + (step || 1);
            this.set({
                "variables": variables,
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
        },
        decrementVariable: function(name, step) {
            this.incrementVariable(name, -1 * step);
        },
        evaluateCondition: function(condition) {
            //console.log("evaluate condition: " + condition);
            var parser = new Parser(condition);
            var result = parser.evaluate(this);
            this.stepState();
            return result;
        },
        evaluateCode: function(code) {
            //console.log("evaluate code: " + code);
            var ret = false;
            if (code.match(/^\s*return\s*/, code)) {
                code = code.replace(/^\s*return\s*/, "", code);
                ret = true;
            }
            var parser = new Parser(code);
            var result = parser.evaluate(this);
            this.stepState();
            return ret ? result : null;
        },
        evaluateRange: function() {
            //console.log("evaluate range: " + condition);
            var name, start, end;
            return {
                'var': "i",
                'start': start,
                'end': end,
                'step': start > end ? -1 : 1
            };
        },

        applyFunction: function(name, params) {
            if (this.get("functions")[name] !== undefined) return this.get("functions")[name].evaluate(params, this);
            else throw "Compile Error: undefined function '" + name + "'";
        },

        getArrayValue: function(keys) {
            var array = this.getVariable(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                if (array.constructor === Array) array = array[keys[i]];
                else throw "Compile Error: " + name + " is not an Array, but " + array.constructor.name;
                name += "[" + keys[i] + "]";
            }
            if (array.constructor === Array) return array[keys[i]];
            else throw "Compile Error: " + name + " is not an Array, but " + array.constructor.name;
        },

        setArrayValue: function(keys, value) {
            var array = this.getVariable(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                if (array.constructor === Array) array = array[keys[i]];
                else throw "Compile Error: " + name + " is not an Array, but " + array.constructor.name;
                name += "[" + keys[i] + "]";
            }
            if (array.constructor === Array) array[keys[i]] = value;
            else throw "Compile Error: " + name + " is not an Array, but " + array.constructor.name;
        }

    });
    return Context;
});
