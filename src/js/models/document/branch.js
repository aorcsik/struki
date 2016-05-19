define([
    'require',
    'models/document/abstract_element'
], function(require, AbstractElement) {
    var Branch = AbstractElement.extend({
        _type: "branch",
        _new: false,
        defaults: {
            "condition": "I"
        },
        initialize: function() {
            var self = this,
                Sequence = require('models/document/sequence'),
                sequence = new Sequence({'parent': this});
            this.listenTo(sequence, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set("sequence", sequence);
        },

        getCondition: function() {
            return this.get("condition");
        },
        getSequence: function() {
            return this.get("sequence");
        },

        serialize: function() {
            return {
                "type": this._type,
                "condition": this.getCondition(),
                "sequence": this.getSequence().serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var Sequence = require('models/document/sequence'),
                    sequence = new Sequence({'parent': this});
                sequence.deserialize(json.sequence);
                this.listenTo(sequence, 'change', function(e) {
                    self.trigger('change', e);
                });
                this.set({
                    "condition": json.condition,
                    "sequence": sequence
                });
            }
        },

        evaluate: function(context) {
            var condition = this.getCondition(),
                result = {
                'condition': true,
                'result': null
            };
            if (condition) {
                result.condition = this.evaluateCode(context, "return " + condition);
            }
            if (result.condition) {
                result.result = this.getSequence().evaluate(context);
            }
            return result;
        }
    });
    return Branch;
});
