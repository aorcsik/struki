define([
    'jquery',
    'underscore',
    'backbone',
    'models/command',
    'models/struktogram'
], function($, _, Backbone, Command, Struktogram) {
    var Main = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this;
        },
        newStruktogram: function(name) {
            var self = this;
            this.set("struktogram", new Struktogram({'name': "struki"}));
            this.get("struktogram").get("sequence").addCommand(new Command());
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
        }
    });
    return Main;
});
