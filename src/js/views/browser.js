define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/struktogram',
    'text!../../templates/browser.html'
], function($, _, Backbone, StruktogramBrowserView, browserTemplate){
    var BrowserView = Backbone.View.extend({
        id: "browser",
        events: {
            "click .close-struktogram": "closeStruktogram"
        },
        template: _.template(browserTemplate),
        stuktogram: null,

        initialize: function() {
            var self = this;
            this.struktogram = null;
            if (this.model.get("active_document")) {
                this.stuktogram = new StruktogramBrowserView({'model': this.model.get("active_document").get("struktogram")});
            }
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined && e.changed.context === undefined) return;
                if (self.struktogram) {
                    self.struktogram.close();
                }
                self.struktogram = null;
                self.render();
            });
        },

        onClose: function() {},

        closeStruktogram: function() {
            this.model.closeDocument(this.model.get("active_document"));
            return false;
        },

        render: function() {
            this.$el.html(this.template({

            }));
            if (this.model.get("active_document")) {
                this.struktogram = new StruktogramBrowserView({'model': this.model.get("active_document").get("struktogram")});
                this.$el.children(".struktogram-container").append(this.struktogram.$el);
                this.struktogram.render();
            }
            return this;
        }
    });
    return BrowserView;
});
