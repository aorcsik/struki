define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'views/ui-toolbar',
    'views/ui-editor',
    'views/ui-output',
    'views/ui-watcher',
    'views/ui-canvas',
    'text!../../examples/struki.json'
], function($, _, Backbone, Localization, UIToolbarView, UIEditorView, UIOutputView, UIWatcherView, UICanvasView, exampleJSON){
    var UIView = Backbone.View.extend({
        id: "content",
        events: {
            "mousemove": "handleMouseMove",
            "mouseup": "handleMouseUp",
            "mousedown .ui-output .vertical-divider": "startHorizontalResizeOutput",
            "mousedown .ui-output .horizontal-divider": "startVerticalResizeOutput",
            "mousedown .ui-editor .vertical-divider": "startHorizontalResizeEditor"
        },

        initialize: function() {
            var self = this;

            this.toolbar = new UIToolbarView({'model': this.model});
            this.editor = new UIEditorView({'model': this.model});
            this.output = new UIOutputView({'model': this.model});
            this.watcher = new UIWatcherView({'model': this.model});
            this.canvas = new UICanvasView({'model': this.model});

            Localization.setLocale(this.model.get("locale"));
            this.listenTo(this.model, 'change:locale', function(model, value) {
                Localization.setLocale(value);
            });
            this.listenTo(this.model, 'change', function(model) {
                if (model.changed.output_width !== undefined ||
                    model.changed.output_height !== undefined ||
                    model.changed.editor_width !== undefined ||
                    model.changed.window_width !== undefined ||
                    model.changed.window_height !== undefined ||
                    model.changed.canvas_zoom !== undefined ||
                    model.changed.unsafe !== undefined) {
                    self.updateLayout();
                }
            });
            this.updateLayout();
        },

        onClose: function() {},

        output_vertical_resize: false,
        output_horizontal_resize: false,
        editor_horizontal_resize: false,
        startVerticalResizeOutput: function() {
            this.output_vertical_resize = true;
        },
        startHorizontalResizeOutput: function() {
            this.output_horizontal_resize = true;
        },
        startHorizontalResizeEditor: function() {
            this.editor_horizontal_resize = true;
        },
        handleMouseUp: function() {
            if (this.output_horizontal_resize) this.output_horizontal_resize = false;
            if (this.output_vertical_resize) this.output_vertical_resize = false;
            if (this.editor_horizontal_resize) this.editor_horizontal_resize = false;
        },
        handleMouseMove: function(e) {
            var available_space, divider_position, new_size;
            if (this.output_horizontal_resize) {
                available_space = this.model.getWindowWidth() - this.model.getEditorWidth();
                divider_position = e.pageX - this.model.getEditorWidth();
                new_size = Math.floor(divider_position / available_space * 1000) / 10;
                this.model.set("output_width", [new_size, "%"]);
            }
            if (this.output_vertical_resize) {
                available_space = this.model.getWindowHeight();
                divider_position = this.model.getWindowHeight() - e.pageY;
                new_size = Math.floor(divider_position / available_space * 1000) / 10;
                this.model.set("output_height", [new_size, "%"]);
            }
            if (this.editor_horizontal_resize) {
                available_space = this.model.getWindowWidth();
                divider_position = e.pageX - 6;
                new_size = Math.floor(divider_position / available_space * 1000) / 10;
                this.model.set("editor_width", [new_size, "%"]);
            }
        },

        updateLayout: function() {
            this.$el.css({
                'width': this.model.get('window_width'),
                'height': this.model.get('window_height')
            });

            this.editor.updateLayout();
            this.output.updateLayout();
            this.watcher.updateLayout();
            this.canvas.updateLayout();

            if (this.model.get("unsafe")) {
                this.$el.addClass("unsafe");
            } else {
                this.$el.removeClass("unsafe");
            }
        },

        render: function() {
            var self = this;

            this.toolbar.$el.appendTo(this.$el);
            this.editor.$el.appendTo(this.$el);
            this.output.$el.appendTo(this.$el);
            this.watcher.$el.appendTo(this.$el);
            this.canvas.$el.appendTo(this.$el);

            this.toolbar.render();
            this.editor.render();
            this.output.render();
            this.watcher.render();
            this.canvas.render();

            this.model.updateWindowSize($(window).width(), $(window).height());
            $(window).resize(function() {
                self.model.updateWindowSize($(window).width(), $(window).height());
            });

            this.$el.on("dragover", function(e) {
                e.stopPropagation();
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'copy';
                self.$el.addClass("drag-over");
                return false;
            }).on("dragenter", function(e) {
                self.$el.addClass("drag-over");
                return false;
            }).on("dragleave", function(e) {
                self.$el.removeClass("drag-over");
                return false;
            }).on("drop", function(e) {
                e.stopPropagation();
                e.preventDefault();
                self.toolbar.openDocument(e.originalEvent.dataTransfer.files);
                self.$el.removeClass("drag-over");
                return false;
            });

            return this;
        }
    });
    return UIView;
});
