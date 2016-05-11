define([
    'require',
    'jquery',
    'underscore',
    'backbone'
], function(require, $, _, Backbone) {
    var Loop = Backbone.Model.extend({
        _type: "loop",
        _new: false,
        defaults: {
            "condition": "I",
            "test_after": false,
            "range": false,
        },
        initialize: function() {
            var self = this;
            var Sequence = require('models/document/sequence');
            this.set("sequence", new Sequence({'parent': this}));
            this.listenTo(this.get("sequence"), 'change', function(e) {
                // console.log("sequence -> loop", e);
                self.trigger('change', e);
            });
        },
        serialize: function() {
            return {
                'type': this._type,
                'condition': this.get("condition"),
                'test_after': this.get("test_after"),
                'range': this.get("range"),
                'sequence': this.get("sequence").serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var Sequence = require('models/document/sequence');
                var sequence = new Sequence({'parent': this});
                sequence.deserialize(json.sequence);
                this.set({
                    "sequence": sequence,
                    "condition": json.condition,
                    "test_after": json.test_after,
                    "range": json.range
                });
                this.listenTo(this.get("sequence"), 'change', function(e) {
                    // console.log("sequence -> loop", e);
                    self.trigger('change', e);
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluateCondition: function(context) {
            try {
                // this.trigger("evaluate", this);
                return context.evaluateCondition(this.get("condition"));
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        },
        range_helper: null,
        initRange: function(context) {
            try {
                this.range_helper = -1;
                return context.evaluateRange(this.get("condition"));
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        },
        evaluateRange: function(context, range) {
            try {
                // this.trigger("evaluate", this);
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
                sequence = this.get("sequence");
            var return_value = null;
            if (this.get("range")) {
                var range = this.initRange(context);
                while (this.evaluateRange(context, range)) {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                }
            } else if (this.get("test_after")) {
                do {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                } while (this.evaluateCondition(context));
            } else {
                while (this.evaluateCondition(context)) {
                    return_value = sequence.evaluate(context);
                    if (return_value !== null) return return_value;
                }
            }
            return return_value;
        }
    });
    return Loop;
});
