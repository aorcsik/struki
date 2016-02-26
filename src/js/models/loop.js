define([
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function($, _, Backbone, Sequence) {
    var Loop = Backbone.Model.extend({
        type: "loop",
        defaults: {
            "condition": "I",
            "test_after": false,
            "range": false,
        },
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence());
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                'type': "loop",
                'condition': this.get("condition"),
                'test_after': this.get("test_after"),
                'range': this.get("range"),
                'sequence': this.get("sequence").toJSON()
            };
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
