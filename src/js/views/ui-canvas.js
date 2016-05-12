    define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'views/canvas/canvas',
    'text!../../templates/ui-canvas.html'
], function($, _, Backbone, Localization, CanvasView, UICanvasTemplate){
    var UICanvasView = Backbone.View.extend({
        className: "ui-canvas",
        events: {
            "click .panel-heading li": "handleSelectTab",
            "click .panel-heading li .close-tab": "handleCloseTab",
            "click .panel-heading li .edit-name": "handleEditName",
            "click .panel-heading li .save-name": "handleSaveName",
            "click .panel-heading li input[name='name']": "handleInputClick",
            "keyup .panel-heading li input[name='name']": "handleInputKeyup",
            "click .panel-heading li .zoom-up": "handleZoomUp",
            "click .panel-heading li .zoom-down": "handleZoomDown"
        },
        template: _.template(UICanvasTemplate),
        struktogram: null,
        helpers: null,

        initialize: function() {
            var self = this;
            this.struktogram = null;
            this.helpers = [];
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document !== undefined ||
                    e.changed.open_documents !== undefined ||
                    e.changed.context !== undefined ||
                    e.changed.helpers !== undefined) {
                    if (self.struktogram) {
                        self.struktogram.close();
                        self.helpers.forEach(function(helper) {
                            helper.close();
                        });
                    }
                    self.struktogram = null;
                    self.helpers = [];
                    self.render();
                }
                if (e.changed.name !== undefined) {
                    this.$el.find(".active .document-title").text(e.changed.name);
                }
            });
        },

        handleZoomUp: function() {
            var canvas_zoom = this.model.get("canvas_zoom");
            this.model.set("canvas_zoom", Math.max(50, canvas_zoom - 5));
            this.render();
        },

        handleZoomDown: function() {
            var canvas_zoom = this.model.get("canvas_zoom");
            this.model.set("canvas_zoom", Math.min(150, canvas_zoom + 5));
            this.render();
        },

        handleInputClick: function(e) {
            return false;
        },

        handleInputKeyup: function(e) {
            e.stopPropagation();
            if (e.keyCode == 13) {
                this.handleSaveName(e);
            }
            if (e.keyCode == 27) {
                this.render();
            }
        },

        handleEditName: function(e) {
            this.handleSelectTab(e);
            var doc_cid = $(e.target).closest("li").data("cid");
            this.render(doc_cid);
            this.$el.find("input[name='name']").focus();
            return false;
        },

        handleSaveName: function(e) {
            var self = this,
                $tab = $(e.target).closest("li"),
                doc_cid = $tab.data("cid"),
                new_name = $tab.find("input[name='name']").val().replace(/^\s+|\s+$/, "");
            this.model.get("open_documents").forEach(function(doc) {
                if (doc.cid === doc_cid && new_name) {
                    doc.set("name", new_name);
                    self.render();
                }
            });
            return false;
        },

        handleSelectTab: function(e) {
            var self = this;
                doc_cid = $(e.target).closest("li").data("cid");
            if (this.model.get("active_document").cid !== doc_cid) {
                this.model.get("open_documents").forEach(function(doc) {
                    if (doc.cid === doc_cid) self.model.openDocument(doc);
                });
            }
        },
        handleCloseTab: function(e) {
            var self = this;
                doc_cid = $(e.target).closest("li").data("cid");
            this.model.get("open_documents").forEach(function(doc) {
                if (doc.cid === doc_cid && window.confirm(Localization.gettext("Are you sure, you want to close this document?", true))) {
                    self.model.closeDocument(doc);
                }
            });
            return false;
        },

        onClose: function() {},

        render: function(edit) {
            var self = this;
            if (this.model.get("active_document")) {
                this.struktogram = new CanvasView({'model': this.model.get("active_document").get("struktogram")});
                this.helpers = this.model.get("active_document").get("helpers").map(function(helper) {
                    return new CanvasView({'model': helper});
                });
                this.$el.html(this.template({
                    "empty": false,
                    "model": this.model,
                    "L": Localization,
                    "edit": edit
                }));
                var $canvas_container = this.$el.find(".canvas-container");
                $canvas_container.append(this.struktogram.$el);
                this.struktogram.render();
                this.struktogram.$el.css({
                    'width': this.struktogram.$el.attr("width") * self.model.get("canvas_zoom") / 100,
                    'height': this.struktogram.$el.attr("height") * self.model.get("canvas_zoom") / 100
                });
                this.helpers.forEach(function(helper) {
                    $canvas_container.append(helper.$el);
                    helper.render();
                    helper.$el.css({
                        'width': helper.$el.attr("width") * self.model.get("canvas_zoom") / 100,
                        'height': helper.$el.attr("height") * self.model.get("canvas_zoom") / 100
                    });
                });
                this.updateLayout();
            } else {
                this.$el.html(this.template({
                    "empty": true,
                    "L": Localization
                }));
            }
            return this;
        },

        updateLayout: function() {
            var toolbar_height = $(".ui-toolbar").outerHeight();
            var output_height = this.model.getOutputHeight();
            var editor_width = this.model.getEditorWidth(null, 100);
            this.$el.css({
                'right': 0,
                'top': toolbar_height,
                'left': editor_width,
                'bottom': output_height
            });
            this.$el.find(".canvas-scroll-container").css({
                'height': this.$el.height() - this.$el.find(".panel-heading").outerHeight()
            });
        }
    });
    return UICanvasView;
});
