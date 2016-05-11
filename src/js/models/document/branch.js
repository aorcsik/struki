define([
    'require',
    'jquery',
    'underscore',
    'backbone'
], function(require, $, _, Backbone) {
    var Branch = Backbone.Model.extend({
        _type: "branch",
        _new: false,
        defaults: {
            "condition": "I"
        },
        initialize: function() {
            var self = this;
            var Sequence = require('models/document/sequence');
            this.set("sequence", new Sequence({'parent': this}));
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        serialize: function() {
            return {
                "type": this._type,
                "condition": this.get("condition"),
                "sequence": this.get("sequence").serialize()
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var Sequence = require('models/document/sequence');
                var sequence = new Sequence({'parent': this});
                sequence.deserialize(json.sequence);
                this.set({
                    "condition": json.condition,
                    "sequence": sequence
                });
                this.listenTo(this.get("sequence"), 'change', function(e) {
                    self.trigger('change', e);
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluateCondition: function(context) {

        },
        evaluate: function(context) {
            var result = {'condition': false, 'result': null};
            try {
                result.condition = context.evaluateCondition(this.get("condition") ? this.get("condition") : "I");
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
            if (result.condition) {
                result.result = this.get("sequence").evaluate(context);
            }
            return result;
        }
    });
    return Branch;
});
