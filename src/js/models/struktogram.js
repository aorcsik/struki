define([
    'jquery',
    'underscore',
    'backbone',
    'models/variable',
    'models/sequence'
], function($, _, Backbone, Variable, Sequence) {
    var Struktogram = Backbone.Model.extend({
        _type: "struktogram",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence({'parent': this}));
            this.set("parameters", []);
            this.set("variables", []);
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                'type': this._type,
                'name': this.get("name"),
                'parameters': this.get("parameters").map(function(parameter) {
                    return parameter.toJSON();
                }),
                'variables': this.get("variables").map(function(variable) {
                    return variable.toJSON();
                }),
                'sequence': this.get("sequence").toJSON()
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this._type) {
                var sequence = new Sequence({'parent': this});
                sequence.fromJSON(json.sequence);
                this.set({
                    "name": json.name,
                    "variables": json.variables.map(function(variable_json) {
                        var variable = new Variable();
                        variable.fromJSON(variable_json);
                        return variable;
                    }),
                    "parameters": json.parameters.map(function(variable_json) {
                        var variable = new Variable();
                        variable.fromJSON(variable_json);
                        return variable;
                    }),
                    "sequence": sequence
                });
            }
        },
        getStruktogram: function() {
            return this;
        },
        evaluate: function(parameters, context) {
            var variables = context.get("variables");
            this.get("parameters").forEach(function(parameter, idx) {
                variables[parameter.get("name")] = parameters[idx];
            });
            this.get("variables").forEach(function(variable, idx) {
                variables[variable.get("name")] = null;
            });
            context.set({
                "variables": variables,
                "_counter": context.get("_counter") ? context.get("_counter") + 1 : 1,
                "_updated_at": (new Date()).getTime()
            });
            return this.get("sequence").evaluate(context);
        }
    });
    return Struktogram;
});
