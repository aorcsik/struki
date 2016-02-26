define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Command = Backbone.Model.extend({
        _type: "command",
        defaults: {
            "code": "–––"
        },
        toJSON: function() {
            return {
                'type': this._type,
                'code': this.get("code")
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this._type) {
                this.set({
                    "code": json.code
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluate: function(context) {
            try {
                this.trigger("evaluate", this);
                return context.evaluateCode(this.get("code"));
            } catch (e) {
                if (e == "DEBUG STOP") this.trigger("debugstop", this);
                throw e;
            }
        }
    });
    return Command;
});
