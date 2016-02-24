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
        }
    });
    return Branch;
});
