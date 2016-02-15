define([
    'jquery',
    'underscore',
    'backbone',
    'models/condition',
    'models/sequence'
], function($, _, Backbone, Condition, Sequence) {
    var Branch = Backbone.Model.extend({
        defaults: {
            "condition": new Condition()
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
    return Branch;
});
