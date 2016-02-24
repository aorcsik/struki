define([
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function($, _, Backbone, Sequence) {
    var Struktogram = Backbone.Model.extend({
        type: "struktogram",
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence());
            this.set("parameters", []);
            this.set("variables", []);
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                'type': "struktogram",
                'name': this.get("name"),
                'parameters': this.get("parameters").map(function(parameter) {
                    return parameter.toJSON();
                }),
                'variables': this.get("variables").map(function(variable) {
                    return variable.toJSON();
                }),
                'sequence': this.get("sequence").toJSON()
            };
        }
    });
    return Struktogram;
});
