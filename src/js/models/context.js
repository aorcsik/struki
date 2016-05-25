define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'lib/parse_error',
    'lib/compile_error',
    'models/function_wrapper'
], function($, _, Backbone, Parser, ParseError, CompileError, FunctionWrapper) {

    /** This is a flag exception to stop evaluation. */
    function DebugStopException() {}

    /** This exception is thrown, when context detects unsafe condition
        like state counter reaches iteration limit. */
    function UnsafeException() {}
    UnsafeException.prototype.toString = function() {
        return "Too many iterations, possible infinite loop.";
    };

    /** Context is the object that handles variables and functions in runtime.
        Expression Parser can be reached through this. */
    var Context = Backbone.Model.extend({
        'DebugStopException': DebugStopException,
        'UnsafeException': UnsafeException,

        defaults: {
            'name': "global"
        },

        initialize: function() {
            this.set({
                "types": $.extend({}, this.get("types")),
                "variables": $.extend({}, this.get("variables")),
                "functions": $.extend({}, this.get("functions"))
            });
        },

        /** Getter functions */
        getName: function() {
            return this.get("name");
        },
        getVariables: function() {
            return this.get("variables");
        },
        getFunctions: function() {
            return this.get("functions");
        },

        /** Test if parameters is an error. */
        isError: function(exc) {
            return exc.constructor === ParseError ||
                   exc.constructor === CompileError;
        },

        /** Test if parameter is a stop signal. */
        isStop: function(exc) {
            return exc.constructor === DebugStopException;
        },

        /** Incremets state counter, stops evaluation and checks unsafe fonditions */
        stepState: function() {
            var global_context = this.getGlobalContext(),
                state_counter = (global_context.get("_state") || 0) + 1,
                debud_stop = global_context.get('_debug'),
                ui = global_context.get("parent"),
                unsafe = ui.get("unsafe"),
                max_iterations = ui.get("max_iterations");
            global_context.set({"_state": state_counter});
            if (!unsafe && state_counter >= max_iterations) {
                throw new this.UnsafeException();
            }
            if (debud_stop && state_counter === debud_stop) {
                throw new this.DebugStopException();
            }
            return state_counter;
        },

        /** Returns string representation of struktogram values */
        asString: function(value) {
            var self = this;
            if (value !== null && value !== undefined) {
                if (typeof value === "boolean") {
                    return value ? "I" : "H";
                }
                if (typeof value === "number") {
                    return "" + value;
                }
                if (typeof value === "string") {
                    return ("\"" + value.replace(/([\\"])/g, "\\$1") + "\"").replace(/"/g, '&quot;');
                }
                if (typeof value === "object" && value.constructor === Array) {
                    return "[" + value.map(function(item) {
                        return self.asString(item);
                    }).join(", ") + "]";
                }
                if (typeof value === "object" && value.list !== undefined) {
                    return value.list.map(function(item) {
                        return self.asString(item);
                    }).join(", ");
                }
            }
            return "";
        },

        /** Defines a variable in the context */
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
                this.setVariableValue(name, initial_value);
            }
        },
        /** Returns the value of a variable, if it is defined */
        getVariableValue: function(name) {
            if (name == "_") {
                throw new CompileError("_ has no value");
            }
            if (this.get("variables")[name] === undefined) {
                if (Math[name] !== undefined && Math[name].constructor !== Function) {
                    return Math[name];
                }
                throw new CompileError("undefined variable \"" + name + "\"");
            }
            return this.get("variables")[name];
        },
        /* Sets the value of a variable, if it is defined */
        setVariableValue: function(name, value) {
            if (name == "_") {
                return;  // sink
            }
            var variables = $.extend({}, this.get("variables"));
            if (variables[name] === undefined) {
                throw new CompileError("undefined variable \"" + name + "\"");
            }
            var type = this.get("types")[name];

            if (type === "Int" || type === "Float") {
                if (typeof value !== "number" && typeof value !== "string") {
                    throw new CompileError("type mismatch, " + this.asString(value) + " is not a number");
                }
                if (type === "Int") variables[name] = parseInt(value, 10);
                if (type === "Float") variables[name] = parseFloat(value);
                if (isNaN(variables[name])) {
                    throw new CompileError("type mismatch, " + this.asString(value) + " is not a number");
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
            var changed = $.extend({}, this.get("changed"));
            changed[name] = this.getGlobalContext().get("_state");
            this.set({
                "changed": changed,
                "variables": variables
            });
        },
        /** deletes a variable in the context */
        deleteVariable: function(name) {
            var variables = $.extend({}, this.get("variables"));
            if (variables[name] === undefined) {
                throw new CompileError("undefined variable '" + name + "'");
            }
            delete variables[name];
            this.set({"variables": variables});
        },
        /** returns variable value as string */
        getVariableValueAsString: function(name) {
            return this.asString(this.getVariableValue(name));
        },
        /** Checks if parameter is an array */
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
        /** Checks if parameter is an array or string */
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
        /** Return the value of an array index */
        getArrayValue: function(keys) {
            var array = this.getVariableValue(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                this.checkIfArray(array, name, true);
                array = array[keys[i]];
                name += "[" + keys[i] + "]";
            }
            if (keys.length == 2) this.checkIfArrayOrString(array, name, true);
            else this.checkIfArray(array, name, true);
            if (array[keys[i]] === undefined) {
                throw new CompileError("array out of bounds");
            }
            return array[keys[i]];
        },
        /** Sets the value of an array index */
        setArrayValue: function(keys, value) {
            var array = this.getVariableValue(keys[0]);
            var name = keys[0];
            for (var i = 1; i < keys.length - 1; i++) {
                this.checkIfArray(array, name, true);
                array = array[keys[i]];
                name += "[" + keys[i] + "]";
            }
            this.checkIfArray(array, name, true);
            array[keys[i]] = value;
            var changed = $.extend({}, this.get("changed"));
            changed[keys[0]] = this.getGlobalContext().get("_state");
            this.set({
                "changed": changed
            });
        },

        /** Defines a function on the context, parameter can be
             - JavaScript Function
             - «Callable» object */
        defineFunction: function(name, func) {
            for (var x in Parser.prototype.reserved_words) {
                if (Parser.prototype.reserved_words[x] === name) {
                    throw new CompileError("\"" + name + "\" is a reserved word");
                }
            }

            var functions = $.extend({}, this.get("functions"));
            if (func.constructor === Function) {
                func = new FunctionWrapper({'func': func});
            } else if (!func._callable) {  // from CallableInterface
                throw new CompileError("this is not a callable");
            }
            functions[name] = func;
            this.set({"functions": functions});
        },
        /** Calls a function, if it's defined, with context as it's context */
        callFunction: function(name, params) {
            if (this.get("functions")[name] === undefined) {
                if (Math[name] === undefined || Math[name].constructor !== Function) {
                    throw new CompileError("undefined function '" + name + "'");
                }
                this.defineFunction(name, Math[name]);
            }
            return this.get("functions")[name].call(this, params);
        },

        /** Evaluates code expression */
        evaluateCode: function(code, ret, no_step) {
            ret = ret || false;
            if (code.match(/^\s*return\s*/, code)) {
                code = code.replace(/^\s*return\s*/, "", code);
                ret = true;
            }
            var parser = new Parser(code);
            var result = parser.evaluate(this);
            if (!no_step) this.stepState();
            return ret ? result : null;
        },
        /** Evaluates range expression */
        evaluateRange: function(range_condition) {
            var match = range_condition.match(/^\s*([_a-zA-Z][_a-zA-Z0-9]*)\s*(:=|in)\s*(.*)\s*$/);
            if (match !== null) {
                var elements = this.evaluateCode(match[3], true, true);
                if (typeof elements === "object" && elements.constructor === Array) {
                    var ok = false;
                    if (elements.length > 0) {
                        ok = true;
                        this.setVariableValue(match[1], elements.shift());
                    }
                    this.stepState();
                    return {
                        'var': match[1],
                        'elements': elements,
                        'ok': ok
                    };
                }
            }
            throw new CompileError("invalid range expression");
        },

        /** Creates a new subscontext with the functions defined here.
            The parent of the new subcontext will be this one. */
        newSubcontext: function(name) {
            var self = this;
            this.set("context", new Context({
                "parent": this,
                "name": this.getName() + ":" + name,
                "types": $.extend({}, this.get("types")),
                "variables": {},  // no global variables, empty scope
                "functions": $.extend({}, this.get("functions"))
            }));
            this.listenTo(this.get("context"), "change", function(e) {
                self.trigger("change", e);
            });
            return this.get("context");
        },
        /** Removes subcontext */
        removeSubcontext: function() {
            this.set("context", null);
        },

        /** Returns the global context by recusively going up the contexts */
        getGlobalContext: function() {
            return this.getName() === "global" ? this : this.get("parent").getGlobalContext();
        }
    });
    return Context;
});
