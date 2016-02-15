define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Command = Backbone.Model.extend({
        type: "command",
        defaults: {
            "code": "–––"
        }
    });
    return Command;
});
