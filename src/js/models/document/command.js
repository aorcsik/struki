define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Command = Backbone.Model.extend({
        _type: "command",
        _new: false,
        defaults: {
            'code': ""
        },
        serialize: function() {
            return {
                'type': this._type,
                'code': this.get("code")
            };
        },
        deserialize: function(json) {
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
                // this.trigger("evaluate", this);
                // var x = (new Date()).getTime();
                var result = context.evaluateCode(this.get("code"));
                // var time = (new Date()).getTime() - x;
                // if (time > 3) console.log(time, this.get("code"));
                return result;
            } catch (e) {
                if (context.isError(e)) this.trigger("errorstop", this);
                if (context.isStop(e)) this.trigger("debugstop", this);
                throw e;
            }
        }
    });
    return Command;
});
