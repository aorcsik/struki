define([
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function($, _, Backbone, Sequence) {
    var Branch = Backbone.Model.extend({
        type: "branch",
        defaults: {
            "condition": "I"
        },
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence());
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return {
                "type": "branch",
                "condition": this.get("condition"),
                "sequence": this.get("sequence").toJSON()
            };
        },
        evaluate: function(context) {
            return this.get("sequence").evaluate(context);
        }
    });
    return Branch;
});
