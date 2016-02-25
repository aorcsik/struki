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
        evaluate: function(context) {
            var variables;
            var return_value = null;
            if (this.get("range")) {
                var range = context.evaluateRange(this.get("condition"));
                context.setVariable(range.var, range.start);
                while (context.getVariable(range.var) < range.end) {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                    context.incrementVariable(range.var, range.step);
                }
            } else if (this.get("test_after")) {
                do {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                } while (context.evaluateCondition(this.get("condition")));
            } else {
                while (context.evaluateCondition(this.get("condition"))) {
                    return_value = this.get("sequence").evaluate(context);
                    if (return_value !== null) return return_value;
                }
            }
            return return_value;
        }
    });
    return Loop;
});
