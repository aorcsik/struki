define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Variable = Backbone.Model.extend({
        defaults: {
        },
        serialize: function() {
            return {
                'name': this.get("name"),
                'type': this.get("type")
            };
        },
        deserialize: function(json) {
            this.set(json);
        }
    });
    return Variable;
});
