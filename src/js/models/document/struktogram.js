define([
    'jquery',
    'underscore',
    'backbone',
    'models/document/variable',
    'models/document/sequence'
], function($, _, Backbone, Variable, Sequence) {
    var Struktogram = Backbone.Model.extend({
        _type: "struktogram",
        _new: false,
        defaults: {
            'helper': false
        },
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence({'parent': this}));
            this.set("parameters", []);
            this.set("variables", []);
            this.listenTo(this.get("sequence"), 'change', function(e) {
                // console.log("sequence -> struktogram", e);
                self.trigger('change', e);
            });
        },
        serialize: function() {
            return {
                'type': this._type,
                'name': this.get("name"),
                'helper': this.get("helper"),
                'parameters': this.get("parameters").map(function(parameter) {
                    return parameter.serialize();
                }),
                'variables': this.get("variables").map(function(variable) {
                    return variable.serialize();
                }),
                'sequence': this.get("sequence").serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var sequence = new Sequence({'parent': this});
                sequence.deserialize(json.sequence);
                this.set({
                    "name": json.name,
                    "helper": json.helper || false,
                    "variables": json.variables.map(function(variable_json) {
                        var variable = new Variable();
                        variable.deserialize(variable_json);
                        return variable;
                    }),
                    "parameters": json.parameters.map(function(variable_json) {
                        var variable = new Variable();
                        variable.deserialize(variable_json);
                        return variable;
                    }),
                    "sequence": sequence
                });
                this.listenTo(this.get("sequence"), 'change', function(e) {
                    // console.log("sequence -> struktogram", e);
                    self.trigger('change', e);
                });
            }
        },
        getStruktogram: function() {
            return this;
        },
        updateStruktogram: function(update) {
            if (update.variables) {
                update.variables = update.variables.map(function(data) {
                    return new Variable(data);
                });
            }
            if (update.parameters) {
                update.parameters = update.parameters.map(function(data) {
                    return new Variable(data);
                });
            }
            this.set($.extend({
                "_counter": this.get("_counter") ? this.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            }, update));
        },
        evaluate: function(parameters, parent_context) {
            var context = parent_context.newContext(this.get("name"));
            this.get("parameters").forEach(function(parameter, idx) {
                context.defineVariable(parameter.get("name"), parameter.get("type"), parameters[idx]);
            });
            this.get("variables").forEach(function(variable, idx) {
                context.defineVariable(variable.get("name"), variable.get("type"));
            });
            var result = this.get("sequence").evaluate(context);
            parent_context.removeSubContext();
            this.trigger("return", result);
            return result;
        }
    });
    return Struktogram;
});
