define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/struktogram',
    'text!../../templates/browser.html'
], function($, _, Backbone, StruktogramBrowserView, browserTemplate){
    var BrowserView = Backbone.View.extend({
        id: "browser",
        events: {},
        template: _.template(browserTemplate),
        stuktogram: null,

        initialize: function() {
            var self = this;
            this.struktogram = null;
            if (this.model.get("active_document")) {
                this.stuktogram = new StruktogramBrowserView({'model': this.model.get("active_document").get("struktogram")});
            }
            this.listenTo(this.model, "change", function() {
                if (this.struktogram) this.struktogram.close();
                if (self.model.get("active_document")) {
                    this.struktogram = new StruktogramBrowserView({'model': self.model.get("active_document").get("struktogram")});
                }
                self.render();
            });
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            if (this.struktogram) {
                this.$el.find(".struktogram-container").append(this.struktogram.$el);
                this.struktogram.render();
            }
            return this;
        }
    });
    return BrowserView;
});
