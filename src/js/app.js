// Filename: app.js
define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'bootstrap',
    'bootstrap_material_design',
    'jquery_ui'
], function($, _, Backbone, Router) {

    Backbone.View.prototype.close = function() {
        // console.log("Close View", this.cid);
        this.$el.remove();
        this.remove();
        this.unbind();
        if (this.onClose){
            this.onClose();
        }
    };

    var App = Backbone.View.extend({
        initialize: function() {
            $.material.init();
            var router = new Router();
        }
    });

    return App;
});
