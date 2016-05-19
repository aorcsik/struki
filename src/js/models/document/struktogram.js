define([
    'models/document/abstract_element',
    'interfaces/callable',
    'models/document/variable',
    'models/document/sequence'
], function(AbstractElement, Callable, Variable, Sequence) {
    var Struktogram = AbstractElement.extend(Callable).extend({
        _type: "struktogram",
        _new: false,
        defaults: {
            'helper': false
        },
        initialize: function() {
            var self = this,
                sequence = new Sequence({'parent': this});
            this.listenTo(sequence, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({
                "sequence": sequence,
                "parameters": [],
                "variables": []
            });
        },

        getName: function() {
            return this.get("name");
        },
        getSequence: function() {
            return this.get("sequence");
        },
        getParameters: function() {
            return this.get("parameters").map(function(parameter) { return parameter; });
        },
        getVariables: function() {
            return this.get("variables").map(function(variable) { return variable; });
        },
        isHelper: function() {
            return this.get("helper");
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

        serialize: function() {
            return {
                'type': this._type,
                'name': this.getName(),
                'helper': this.isHelper(),
                'parameters': this.getParameters().map(function(parameter) { return parameter.serialize(); }),
                'variables': this.getVariables().map(function(variable) { return variable.serialize(); }),
                'sequence': this.getSequence().serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var sequence = new Sequence({'parent': this});
                sequence.deserialize(json.sequence);
                this.listenTo(sequence, 'change', function(e) {
                    self.trigger('change', e);
                });
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
            }
        },

        evaluate: function(context) {
            return this.getSequence().evaluate(context);
        },

        call: function(parent_context, parameters) {
            var context = parent_context.newSubcontext(this.getName());
            try {
                this.getParameters().forEach(function(parameter, idx) {
                    context.defineVariable(parameter.getName(), parameter.getType(), parameters[idx]);
                });
                this.getVariables().forEach(function(variable, idx) {
                    context.defineVariable(variable.getName(), variable.getType());
                });
                context.stepState();
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }

            var result = this.evaluate(context);

            parent_context.removeSubContext();
            this.trigger("return", result);
            return result;
        }
    });
    return Struktogram;
});
