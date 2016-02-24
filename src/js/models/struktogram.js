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
            this.listenTo(this.get("sequence"), 'change', function(e) {
                self.trigger('change', e);
            });
        }
    });
    return Struktogram;
});
