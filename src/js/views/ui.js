define([
    'jquery',
    'underscore',
    'backbone',
    'views/ui-toolbar',
    'views/browser',
    'views/output',
    'views/watcher',
    'views/properties',
    'views/ui-canvas',
    'text!../../examples/struki.json'
], function($, _, Backbone, UIToolbarView, BrowserView, OutputView, WatcherView, PropertiesView, UICanvasView, exampleJSON){
    var UIView = Backbone.View.extend({
        id: "content",
        events: {
            "mousemove": "handleMouseMove",
            "mouseup": "handleMouseUp",
            "mousedown #output .vertical-divider": "startHorizontalResizeOutput",
            "mousedown #output .horizontal-divider": "startVerticalResizeOutput",
            "mousedown #browser .vertical-divider": "startHorizontalResizeBrowser"
        },

        initialize: function() {
            var self = this;

            this.toolbar = new UIToolbarView({'model': this.model});
            this.browser = new BrowserView({'model': this.model});
            this.output = new OutputView({'model': this.model});
            this.watcher = new WatcherView({'model': this.model});
            this.properties = new PropertiesView({'model': this.model});
            this.canvas = new UICanvasView({'model': this.model});

            this.listenTo(this.model, 'change', function() {
                self.updateLayout();
            });
        },

        onClose: function() {},

        output_vertical_resize: false,
        output_horizontal_resize: false,
        browser_horizontal_resize: false,
        startVerticalResizeOutput: function() {
            this.output_vertical_resize = true;
        },
        startHorizontalResizeOutput: function() {
            this.output_horizontal_resize = true;
        },
        startHorizontalResizeBrowser: function() {
            this.browser_horizontal_resize = true;
        },
        handleMouseUp: function() {
            if (this.output_horizontal_resize) this.output_horizontal_resize = false;
            if (this.output_vertical_resize) this.output_vertical_resize = false;
            if (this.browser_horizontal_resize) this.browser_horizontal_resize = false;
        },
        handleMouseMove: function(e) {
            var available_space, divider_position, new_size;
            if (this.output_horizontal_resize) {
                available_space = this.model.getWindowWidth() - this.model.getBrowserWidth();
                divider_position = e.pageX - this.model.getBrowserWidth();
                new_size = Math.floor(divider_position / available_space * 1000) / 10;
                this.model.set("output_width", [new_size, "%"]);
            }
            if (this.output_vertical_resize) {
                new_size = this.model.getWindowHeight() - e.pageY;
                this.model.set("output_height", [new_size, "px"]);
            }
            if (this.browser_horizontal_resize) {
                new_size = e.pageX - 6;
                this.model.set("browser_width", [new_size, "px"]);
            }
        },

        updateLayout: function() {
            var toolbar_height = this.toolbar.$el.outerHeight();
            var output_height = this.model.getOutputHeight();
            var window_width = this.model.getWindowWidth();
            var browser_width = this.model.getBrowserWidth(null, 100);
            var output_width = this.model.getOutputWidth(window_width - browser_width, 100);
            this.$el.css({
                'width': this.model.get('window_width'),
                'height': this.model.get('window_height')
            });
            this.browser.$el.css({
                'left': 0,
                'bottom': 0,
                'top': toolbar_height,
                'width': browser_width
            });
            this.output.$el.css({
                'bottom': 0,
                'left': browser_width,
                'width': output_width,
                'height': output_height
            });
            this.watcher.$el.css({
                'right': 0,
                'bottom': 0,
                'width': window_width - browser_width - output_width,
                'height': output_height
            });
            this.canvas.$el.css({
                'right': 0,
                'top': toolbar_height,
                'left': browser_width,
                'bottom': output_height
            });
            this.canvas.$el.find(".canvas-container").css({
                'height': this.canvas.$el.height() - this.canvas.$el.find(".panel-heading").outerHeight()
            });
            this.browser.$el.find(".struktogram-container").css({
                'height': this.browser.$el.height()
            });
            this.output.$el.find(".panel-body").css({
                'height': this.output.$el.height() - this.output.$el.find(".panel-heading").outerHeight()
            });
            this.watcher.$el.find(".panel-body").css({
                'height': this.watcher.$el.height() - this.watcher.$el.find(".panel-heading").outerHeight()
            });
        },

        render: function() {
            var self = this;

            this.toolbar.$el.appendTo(this.$el);
            this.browser.$el.appendTo(this.$el);
            this.output.$el.appendTo(this.$el);
            this.watcher.$el.appendTo(this.$el);
            this.properties.$el.appendTo(this.$el).hide();
            this.canvas.$el.appendTo(this.$el);

            this.toolbar.render();
            this.browser.render();
            this.output.render();
            this.watcher.render();
            this.properties.render();
            this.canvas.render();

            this.model.updateWindowSize($(window).width(), $(window).height());
            $(window).resize(function() {
                self.model.updateWindowSize($(window).width(), $(window).height());
            });

            window.setTimeout(function() {
                self.model.openDocumentFromJSON(JSON.parse(exampleJSON));
            }, 500);

            return this;
        }
    });
    return UIView;
});
