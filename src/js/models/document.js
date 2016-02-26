define([
    'jquery',
    'underscore',
    'backbone',
    'models/struktogram'
], function($, _, Backbone, Struktogram) {
    var Document = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this;
        },
        newStruktogram: function(name) {
            var self = this,
                struktogram = new Struktogram({'name': name, 'document': this});
            this.set("struktogram", struktogram);
            this.get("struktogram").get("sequence").newCommand();
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        toJSON: function() {
            return this.get("struktogram").toJSON();
        },
        fromJSON: function(json) {
            var struktogram = new Struktogram({'document': this});
            struktogram.fromJSON(json);
            this.set("struktogram", struktogram);
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
        }
    });
    return Document;
});
