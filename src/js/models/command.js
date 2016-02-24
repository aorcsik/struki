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
        }
    });
    return Command;
});
