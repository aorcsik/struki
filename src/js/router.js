// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone',
    'models/main',
    'views/content'
], function($, _, Backbone, Main, ContentView) {

    var Router = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },

        routes: {
            // Default
            '*actions': 'defaultAction'
        },
        defaultAction: function (actions) {
            var main = new Main();
            main.newStruktogram("struki");

            var content = new ContentView({'model': main});
            content.$el.appendTo($("body"));
            content.render();
        }
    });

    return Router;
});
