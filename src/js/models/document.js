define([
    'jquery',
    'underscore',
    'backbone',
    'models/command',
    'models/struktogram'
], function($, _, Backbone, Command, Struktogram) {
    var Document = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this;
        },
        newStruktogram: function(name) {
            var self = this;
            this.set("struktogram", new Struktogram({'name': name}));
            this.get("struktogram").get("sequence").addCommand(new Command());
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
        },
        toJSON: function() {
            return this.get("struktogram").toJSON();
        },
        fromJSON: function(json) {
            var struktogram = new Struktogram();
            struktogram.fromJSON(json);
            this.set("struktogram", struktogram);
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
        }
    });
    return Document;
});
