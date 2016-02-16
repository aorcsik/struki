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
        },

        onClose: function() {},

        updateSizes: function() {
            var window_width = $(window).width(),
                window_height = $(window).height();
            this.$el.css({'width': window_width, 'height': window_height});
            var toolbar_height = 50;
            var browser_width = 200;
            var output_height = 150;
            var watcher_height = output_height;
            var properties_width = 200;
            this.toolbar.$el.css({'top': 0, 'left': 0, 'width': window_width, 'height': toolbar_height});
            this.browser.$el.css({'top': toolbar_height, 'left': 0, 'width': browser_width, 'height': window_height - toolbar_height - output_height});
            this.output.$el.css({'bottom': 0, 'left': 0, 'width': Math.floor(window_width / 2), 'height': output_height});
            this.watcher.$el.css({'bottom': 0, 'right': 0, 'width': Math.ceil(window_width / 2), 'height': watcher_height});
            this.properties.$el.css({'top': toolbar_height, 'right': 0, 'width': properties_width, 'height': window_height - toolbar_height - watcher_height});
        },

        render: function() {
            var self = this;

            this.toolbar.render().$el.appendTo(this.$el);
            this.browser.render().$el.appendTo(this.$el);
            this.output.render().$el.appendTo(this.$el);
            this.watcher.render().$el.appendTo(this.$el);
            this.properties.render().$el.appendTo(this.$el);

            $(window).resize(function() {
                self.updateSizes();
            });
            self.updateSizes();

            return this;
        }
    });
    return ContentView;
});
