define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'lib/parse_error',
    'lib/compile_error',
    'models/function_wrapper'
], function($, _, Backbone, Parser, ParseError, CompileError, FunctionWrapper) {
    function DebugStopException() {}

    function UnsafeException() {}
    UnsafeException.prototype.toString = function() {
        return "Too many iterations, possible infinite loop.";
    };

    var Context = Backbone.Model.extend({
        defaults: {
            'name': "global"
        },

        initialize: function() {
            var self = this;
            this.set("types", $.extend({}, this.get("types")));
            this.set("variables", $.extend({}, this.get("variables")));
            this.set("functions", $.extend({}, this.get("functions")));
        },

        stepState: function() {
            var global_context = this.getGlobalContext();
            global_context.set({"_state": global_context.get("_state") ? global_context.get("_state") + 1 : 1});
            if (global_context.get("_state") >= global_context.get("parent").get("max_iterations")) {
                throw new UnsafeException();
            }
            if (global_context.get('_debug') && global_context.get('_state') === global_context.get('_debug')) {
                throw new DebugStopException();
            }
        },

        isError: function(exc) {
            return exc.constructor === ParseError ||
                   exc.constructor === CompileError;
        },

        isStop: function(exc) {
            return exc.constructor === DebugStopException;
        },

        toString: function(value) {
            var self = this;
            if (value !== null && value !== undefined) {
                if (typeof value === "number") {
                    return "" + value;
                }
                if (value.constructor === String) {
                    return ("\"" + value.replace(/[\\"]/, "\\$1") + "\"").replace(/"/g, '&quot;');
                }
                if (value.constructor === Array) {
                    return "[" + value.map(function(item) {
                        return self.toString(item);
                    }).join(", ") + "]";
                }
                if (value.list !== undefined) {
                    return value.list.map(function(item) {
                        return self.toString(item);
                    }).join(", ");
                }
            }
            return "";
        },

        defineVariable: function(name, type, initial_value) {
            for (var x in Parser.prototype.reserved_words) {
                if (Parser.prototype.reserved_words[x] === name) {
                    throw new CompileError("\"" + name + "\" is a reserved word");
                }
            }

            var types = $.extend({}, this.get("types")),
                variables = $.extend({}, this.get("variables"));
            if (variables[name] !== undefined) {
                throw new CompileError("variable \"" + name + "\" is already defined");
            }
            types[name] = type;
            variables[name] = null;
            this.set({
                "types": types,
                "variables": variables
            });
            if (initial_value !== undefined) {
                this.setVariable(name, initial_value);
            }
        },
        getVariable: function(name) {
            if (name == "_") {
                throw new CompileError("_ has no value");
            }
            if (this.get("variables")[name] === undefined) {
                if (Math[name] !== undefined && Math[name].constructor !== Function) {
                    return Math[name];
                }
                throw new CompileError("undefined variable '" + name + "'");
            }
            return this.get("variables")[name];
        },
        setVariable: function(name, value) {
            if (name == "_") {
                return;  // sink
            }
            var variables = $.extend({}, this.get("variables"));
            if (variables[name] === undefined) {
                throw new CompileError("undefined variable '" + name + "'");
            }
            var type = this.get("types")[name];

            if (type === "Int" || type === "Float") {
                if (typeof value !== "number" && typeof value !== "string") {
                    throw new CompileError("type mismatch, " + this.toString(value) + " is not a number");
                }
                if (type === "Int") variables[name] = parseInt(value, 10);
                if (type === "Float") variables[name] = parseFloat(value);
                if (isNaN(variables[name])) {
                    throw new CompileError("type mismatch, " + this.toString(value) + " is not a number");
                }
            }
            else if (type === "Bool") variables[name] = Boolean(value);
            else if (type === "String") variables[name] = "" + value;
            else if (type === "Array" || type.match(/\*$/)) {
                this.checkIfArray(value, "value", true);
                variables[name] = value.map(function(item) { return item; });
            } else {
                throw new CompileError("invalid type: " + type);
            }
            this.set({"variables": variables});
        },
        unsetVariable: function(name) {
            var variables = $.extend({}, this.get("variables"));
            if (variables[name] === undefined) {
                throw new CompileError("undefined variable '" + name + "'");
            }
            delete variables[name];
            this.set({"variables": variables});
        },
        getVariableAsString: function(name) {
            return this.toString(this.getVariable(name));
        },
        checkIfArray: function(array, name, throw_error) {
            if (typeof array !== "object") {
                if (throw_error) throw new CompileError("type mismatch, " + name + " is not an Array, but a " + (typeof array));
                else return false;
            } else if (array.constructor !== Array) {
                if (throw_error) throw new CompileError("type mismatch, " + name + " is not an Array, but a " + array.constructor.name);
                else return false;
            }
            return true;
        },
        checkIfArrayOrString: function(array, name, throw_error) {
            if (typeof array !== "object" && typeof array !== "string") {
                if (throw_error) throw new CompileError("type mismatch, " + name + " is not an Array or a String, but a " + (typeof array));
                return false;
            } else if (array.constructor !== Array && array.constructor !== String) {
                if (throw_error) throw new CompileError("type mismatch, " + name + " is not an Array or a String, but a " + array.constructor.name);
                return false;
            }
            return true;
        },
        getArrayValue: function(keys) {
            var array = this.getVariable(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                this.checkIfArray(array, name, true);
                array = array[keys[i]];
                name += "[" + keys[i] + "]";
            }
            this.checkIfArrayOrString(array, name, true);
            if (array[keys[i]] === undefined) {
                throw new CompileError("array out of bounds");
            }
            return array[keys[i]];
        },
        setArrayValue: function(keys, value) {
            var array = this.getVariable(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                this.checkIfArray(array, name, true);
                array = array[keys[i]];
                name += "[" + keys[i] + "]";
            }
            this.checkIfArray(array, name, true);
            array[keys[i]] = value;
        },

        defineFunction: function(name, func) {
            for (var x in Parser.prototype.reserved_words) {
                if (Parser.prototype.reserved_words[x] === name) {
                    throw new CompileError("\"" + name + "\" is a reserved word");
                }
            }

            var functions = $.extend({}, this.get("functions"));
            if (func.constructor === Function) {
                func = new FunctionWrapper({'func': func});
            } else if (func._type !== "struktogram" && func._type !== "function_wrapper") {
                throw new CompileError("this is not a function");
            }
            functions[name] = func;
            this.set({"functions": functions});
        },
        applyFunction: function(name, params) {
            if (this.get("functions")[name] === undefined) {
                if (Math[name] !== undefined && Math[name].constructor === Function) {
                    this.defineFunction(name, Math[name]);
                    return this.get("functions")[name].evaluate(params, this);
                }
                throw new CompileError("undefined function '" + name + "'");
            }
            return this.get("functions")[name].evaluate(params, this);
        },

        evaluateCondition: function(condition) {
            var parser = new Parser(condition);
            var result = parser.evaluate(this);
            this.stepState();
            return result;
        },
        evaluateCode: function(code, ret) {
            ret = ret || false;
            if (code.match(/^\s*return\s*/, code)) {
                code = code.replace(/^\s*return\s*/, "", code);
                ret = true;
            }
            var parser = new Parser(code);
            var result = parser.evaluate(this);
            this.stepState();
            return ret ? result : null;
        },
        evaluateRange: function(range_condition) {
            var match = range_condition.match(/^\s*([_a-zA-Z][_a-zA-Z0-9]*)\s*(:=|in)\s*(.*)\s*$/);
            if (match === null) {
                throw new CompileError("invalid range expression");
            }
            return {
                'var': match[1],
                'list': this.evaluateCode(match[3], true)
            };
        },

        newContext: function(name) {
            var self = this;
            this.set("context", new Context({
                "parent": this,
                "name": this.get("name") + ":" + name,
                "types": $.extend({}, this.get("types")),
                // "variables": $.extend({}, this.get("variables")),  // no global variable scope
                "functions": $.extend({}, this.get("functions"))
            }));
            this.listenTo(this.get("context"), "change", function(e) {
                self.trigger("change", e);
            });
            return this.get("context");
        },
        removeSubContext: function() {
            this.set("context", null);
        },
        getGlobalContext: function() {
            return this.get("name") === "main" ? this : this.get("parent").getGlobalContext();
        }
    });
    return Context;
});
