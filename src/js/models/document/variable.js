define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Variable = Backbone.Model.extend({
        defaults: {
        },
        toJSON: function() {
            return {
                'name': this.get("name"),
                'type': this.get("type")
            };
        },
        fromJSON: function(json) {
            this.set(json);
        }
    });
    return Variable;
});
