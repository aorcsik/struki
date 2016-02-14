// Filename: app.js
define([
    'jquery',
    'underscore',
    'backbone',
    'router'
], function($, _, Backbone, Router) {

    var App = Backbone.View.extend({
        initialize: function() {
            var router = new Router();
        }
    });

    return App;
});
