define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Command = Backbone.Model.extend({
        type: "command",
        defaults: {
            "code": "–––"
        },
        toJSON: function() {
            return {
                'type': "command",
                'code': this.get("code")
            };
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
