define([
    'backbone',
    'interfaces/serializable'
], function(Backbone, Serializable) {
    var Variable = Backbone.Model.extend(Serializable).extend({
        defaults: {},

        getName: function() {
            return this.get("name");
        },
        getType: function() {
            return this.get("type");
        },

        serialize: function() {
            return {
                'name': this.getName(),
                'type': this.getType()
            };
        },
        deserialize: function(json) {
            this.set(json);
        },

        toString: function() {
            return this.getName() + ": " + this.getType();
        }
    });
    return Variable;
});
