define([
    'jquery',
    'underscore',
    'backbone',
    'models/condition',
    'models/sequence'
], function($, _, Backbone, Condition, Sequence) {
    var Loop = Backbone.Model.extend({
        type: "loop",
        defaults: {
            "condition": new Condition(),
            "test_after": false
        },
        initialize: function() {
            var self = this;
            this.set("sequence", new Sequence());
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
            this.listenTo(this.get("condition"), 'change', function(e) {
                self.trigger('change', e);
            });
        }
    });
    return Loop;
});
