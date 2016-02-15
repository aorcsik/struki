define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Sequence = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            this.set("commands", []);
        },
        addCommand: function(command) {
            this.get("commands").push(command);
        }
    });
    return Sequence;
});
