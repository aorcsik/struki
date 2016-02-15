// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone',
    'views/struktogram'
], function($, _, Backbone, StruktogramView) {

    var Router = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },

        routes: {
            // Default
            '*actions': 'defaultAction'
        },
        defaultAction: function (actions) {
            var struktogram = new StruktogramView();
            $("body").append(struktogram.$el);
            struktogram.render();
        }
    });

    return Router;
});
