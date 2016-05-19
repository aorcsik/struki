define([
    'require',
    'models/document/abstract_element'
], function(require, AbstractElement) {
    var Loop = AbstractElement.extend({
        _type: "loop",
        _new: false,
        defaults: {
            "condition": "I",
            "test_after": false,
            "range": false,
        },
        initialize: function() {
            var self = this,
                Sequence = require('models/document/sequence'),
                sequence = new Sequence({'parent': this});
            this.listenTo(sequence, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({"sequence": sequence});
        },

        getCondition: function() {
            return this.get("condition");
        },
        getSequence: function() {
            return this.get("sequence");
        },
        isRange: function() {
            return this.get("range");
        },
        isTestAfter: function() {
            return this.get("test_after");
        },

        serialize: function() {
            return {
                'type': this._type,
                'condition': this.getCondition(),
                'test_after': this.isTestAfter(),
                'range': this.isRange(),
                'sequence': this.getSequence().serialize()
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
                    "sequence": sequence,
                    "condition": json.condition,
                    "test_after": json.test_after,
                    "range": json.range
                });
            }
        },

        range_helper: null,
        initRange: function(context) {
            try {
                this.range_helper = -1;
                return context.evaluateRange(this.getCondition());
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        },
        evaluateRange: function(context, range) {
            try {
                this.range_helper++;
                if (this.range_helper < range.list.length) {
                    context.setVariable(range.var, range.list[this.range_helper]);
                    context.stepState();
                    return true;
                } else {
                    context.stepState();
                    return false;
                }
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        },

        evaluate: function(context) {
            var variables,
                sequence = this.getSequence();
            var return_value = null;
            if (this.isRange()) {
                var range = this.initRange(context);
                while (this.evaluateRange(context, range)) {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                }
            } else if (this.isTestAfter()) {
                do {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                } while (this.evaluateCode(context, "return " + this.getCondition()));
            } else {
                while (this.evaluateCode(context, "return " + this.getCondition())) {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                }
            }
            return return_value;
        }
    });
    return Loop;
});
