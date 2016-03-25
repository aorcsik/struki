define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'models/function_wrapper'
], function($, _, Backbone, Parser, FunctionWrapper) {
    var Context = Backbone.Model.extend({
        defaults: {
            'name': "global"
        },
        initialize: function() {
            var self = this;
            this.set("variables", $.extend({}, this.get("variables")));
            this.set("functions", $.extend({
                "print": new FunctionWrapper({
                    'func': function() {
                        $("#output").data('view').log.apply($("#output").data('view'), arguments);
                    }
                })
            }, this.get("functions")));
        },
        stepState: function() {
            var global_context = this.getGlobalContext();
            global_context.set({"_state": global_context.get("_state") ? global_context.get("_state") + 1 : 1});
            // console.log(this.get('_debug'), this.get('_state'));
            if (global_context.get('_debug') && global_context.get('_state') === global_context.get('_debug')) {
                throw "DEBUG STOP";
            }
        },
        getVariable: function(name) {
            if (this.get("variables")[name] !== undefined) return this.get("variables")[name];
            else throw "Compile Error: undefined variable '" + name + "'";
        },
        defineVariable: function(name, initial_value) {
            var variables = this.get("variables");
            variables[name] = initial_value;
            this.set({
                "variables": variables,
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
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
        defineFunction: function(name, func) {
            var functions = this.get("functions");
            functions[name] = new FunctionWrapper({'func': func});
            this.set({
                "functions": functions,
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
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
                else throw "Compile Error: " + name + " is not Array, but " + array.constructor.name;
                name += "[" + keys[i] + "]";
            }
            if (array.constructor === Array || array.constructor === String) return array[keys[i]];
            else throw "Compile Error: " + name + " is not Array or String, but " + array.constructor.name;
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
        },
        getGlobalContext: function() {
            if (this.get("name") === "global") {
                return this;
            } else {
                return this.get("parent").getGlobalContext();
            }
        },
        newContext: function(name) {
            var self = this;
            this.set("context", new Context({
                "parent": this,
                "name": this.get("name") + ":" + name,
                "variables": $.extend({}, this.get("variables")),
                "functions": $.extend({}, this.get("functions"))
            }));
            this.listenTo(this.get("context"), "change", function(e) {
                self.trigger("change", e);
            });
            return this.get("context");
        }
    });
    return Context;
});
