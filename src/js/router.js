// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone',
    'models/ui',
    'views/ui'
], function($, _, Backbone, UI, UIView) {

    var Router = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },

        routes: {
            // Default
            '*actions': 'defaultAction'
        },
        defaultAction: function (actions) {
            var ui = new UIView({'model': new UI()});
            ui.$el.appendTo($("body"));
            ui.render();
        }
    });

    return Router;
});
