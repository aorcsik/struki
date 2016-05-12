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
                ui_view = new UIView({'model': ui});
            ui_view.$el.appendTo($("body"));
            $("#loading").remove();
            ui_view.render();

            var local_storage = new LocalStorage({'model': ui});
            local_storage.$el.appendTo($("body"));
            local_storage.restoreUISettings();
            local_storage.restoreDocuments();
            local_storage.render("Application loaded");

            local_storage.listenTo(ui_view, 'background_notification', function(msg) {
                local_storage.render(msg.message, msg.params, msg.type);
            });
        }
    });

    return App;
});
