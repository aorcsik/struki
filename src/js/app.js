// Filename: app.js
define([
    'jquery',
    'underscore',
    'backbone',
    'models/ui',
    'views/ui',
    'views/local-storage',
    'bootstrap',
    'bootstrap_material_design',
    'jquery_ui'
], function($, _, Backbone, UI, UIView, LocalStorage) {

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

            var ui = new UI(),
                ui_view = new UIView({'model': ui}),
                local_storage = new LocalStorage({'model': ui});
            ui_view.$el.appendTo($("body"));
            ui_view.render();
        }
    });

    return App;
});
