// Filename: app.js
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'bootstrap',
    'bootstrap_material_design'
], function($, _, Backbone, Router) {

    var App = Backbone.View.extend({
        initialize: function() {
            $.material.init();
            var router = new Router();
        }
    });

    return App;
});
