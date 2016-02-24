define([
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function($, _, Backbone, Sequence) {
    var Loop = Backbone.Model.extend({
        type: "loop",
        defaults: {
            "condition": "I",
            "test_after": false,
            "range": false,
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
                'type': "loop",
                'condition': this.get("condition"),
                'test_after': this.get("test_after"),
                'range': this.get("range"),
                'sequence': this.get("sequence").toJSON()
            };
        }
    });
    return Loop;
});
