define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function(require, $, _, Backbone) {
    var Branch = Backbone.Model.extend({
        type: "branch",
        defaults: {
            "condition": "I"
        },
        initialize: function() {
            var self = this;
            var Sequence = require('models/sequence');
            this.set("sequence", new Sequence());
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                "type": this.type,
                "condition": this.get("condition"),
                "sequence": this.get("sequence").toJSON()
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this.type) {
                var Sequence = require('models/sequence');
                var sequence = new Sequence();
                sequence.fromJSON(json.sequence);
                this.set({
                    "condition": json.condition,
                    "sequence": sequence
                });
            }
        },
        evaluateCondition: function(context) {
            try {
                this.trigger("evaluate", this);
                return context.evaluateCondition(this.get("condition") || "I");
            } catch (e) {
                if (e == "DEBUG STOP") this.trigger("debugstop", this);
                throw e;
            }
        },
        evaluate: function(context) {
            return this.get("sequence").evaluate(context);
        }
    });
    return Branch;
});
