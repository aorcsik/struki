define([
    'require',
    'jquery',
    'underscore',
    'backbone'
], function(require, $, _, Backbone) {
    var Loop = Backbone.Model.extend({
        _type: "loop",
        defaults: {
            "condition": "I",
            "test_after": false,
            "range": false,
        },
        initialize: function() {
            var self = this;
            var Sequence = require('models/sequence');
            this.set("sequence", new Sequence({'parent': this}));
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                'type': this._type,
                'condition': this.get("condition"),
                'test_after': this.get("test_after"),
                'range': this.get("range"),
                'sequence': this.get("sequence").toJSON()
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this._type) {
                var Sequence = require('models/sequence');
                var sequence = new Sequence({'parent': this});
                sequence.fromJSON(json.sequence);
                this.set({
                    "sequence": sequence,
                    "condition": json.condition,
                    "test_after": json.test_after,
                    "range": json.range
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluateCondition: function(context) {
            try {
                this.trigger("evaluate", this);
                return context.evaluateCondition(this.get("condition"));
            } catch (e) {
                if (e == "DEBUG STOP") this.trigger("debugstop", this);
                throw e;
            }
        },
        evaluateRange: function(context, range) {
            try {
                this.trigger("evaluate", this);
                context.stepState();
                return context.getVariable(range.var) < range.end;
            } catch (e) {
                if (e == "DEBUG STOP") this.trigger("debugstop", this);
                throw e;
            }
        },
        evaluate: function(context) {
            var variables;
            var return_value = null;
            if (this.get("range")) {
                var range = context.evaluateRange(this.get("condition"));
                context.setVariable(range.var, range.start);
                while (this.evaluateRange(context, range)) {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                    context.incrementVariable(range.var, range.step);
                }
            } else if (this.get("test_after")) {
                do {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                } while (this.evaluateCondition(context));
            } else {
                while (this.evaluateCondition(context)) {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                }
            }
            return return_value;
        }
    });
    return Loop;
});
