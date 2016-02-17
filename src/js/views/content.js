define([
    'jquery',
    'underscore',
    'backbone',
    'views/toolbar',
    'views/browser',
    'views/output',
    'views/watcher',
    'views/properties',
    'views/editor',
    'models/main'
], function($, _, Backbone, ToolbarView, BrowserView, OutputView, WatcherView, PropertiesView, EditorView, Main){
    var ContentView = Backbone.View.extend({
        id: "content",
        events: {},

        initialize: function() {
            this.toolbar = new ToolbarView({'model': this.model});
            this.browser = new BrowserView({'model': this.model});
            this.output = new OutputView({'model': this.model});
            this.watcher = new WatcherView({'model': this.model});
            this.properties = new PropertiesView({'model': this.model});
            this.editor = new EditorView({'model': this.model});
        },

        onClose: function() {},

        updateLayout: function() {
            var window_height = $(window).height();
            var window_width = $(window).width();
            var toolbar_height = this.toolbar.$el.outerHeight();
            var output_height = this.output.$el.outerHeight();
            var watcher_height = this.output.$el.outerHeight();
            var browser_width = this.browser.$el.outerWidth();
            var properties_width = this.properties.$el.outerWidth();
            this.$el.css({'width': window_width, 'height': window_height});
            this.browser.$el.css({'top': toolbar_height, 'bottom': output_height});
            this.properties.$el.css({'top': toolbar_height, 'bottom': watcher_height});
            this.editor.$el.css({
                'right': properties_width,
                'bottom': output_height,
                'top': toolbar_height,
                'left': browser_width
            });
        },

        render: function() {
            var self = this;

            this.toolbar.$el.appendTo(this.$el);
            this.browser.$el.appendTo(this.$el);
            this.output.$el.appendTo(this.$el);
            this.watcher.$el.appendTo(this.$el);
            this.properties.$el.appendTo(this.$el);
            this.editor.$el.appendTo(this.$el);

            this.toolbar.render();
            this.browser.render();
            this.output.render();
            this.watcher.render();
            this.properties.render();
            this.editor.render();

            this.updateLayout();
            $(window).resize(function() {
                self.updateLayout();
            });

            return this;
        }
    });
    return ContentView;
});
