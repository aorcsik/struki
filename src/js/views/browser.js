define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/browser.html'
], function($, _, Backbone, browserTemplate){
    var BrowserView = Backbone.View.extend({
        id: "browser",
        events: {},
        template: _.template(browserTemplate),

        initialize: function() {
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return BrowserView;
});
