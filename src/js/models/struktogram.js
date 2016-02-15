define([
    'jquery',
    'underscore',
    'backbone',
    'models/sequence'
], function($, _, Backbone, Sequence) {
    var Struktogram = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            this.set("sequence", new Sequence());
        }
    });
    return Struktogram;
});
