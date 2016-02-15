define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Command = Backbone.Model.extend({
        defaults: {
            "code": "–––"
        }
    });
    return Command;
});
