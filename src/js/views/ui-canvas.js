    define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/canvas',
    'text!../../templates/ui-canvas.html'
], function($, _, Backbone, CanvasView, UICanvasTemplate){
    var UICanvasView = Backbone.View.extend({
        className: "ui-canvas",
        events: {
            "click .panel-heading li": "handleSelectTab",
            "click .panel-heading li .close-tab": "handleCloseTab"
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

        handleSelectTab: function(e) {
            var self = this;
                doc_cid = $(e.target).closest("li").data("cid");
            this.model.get("open_documents").forEach(function(doc) {
                if (doc.cid === doc_cid) self.model.openDocument(doc);
            });
        },
        handleCloseTab: function(e) {
            var self = this;
                doc_cid = $(e.target).closest("li").data("cid");
            this.model.get("open_documents").forEach(function(doc) {
                if (doc.cid === doc_cid) self.model.closeDocument(doc);
            });
            return false;
        },

        onClose: function() {},

        render: function() {
            var self = this;
            if (this.model.get("active_document")) {
                this.struktogram = new CanvasView({'model': this.model.get("active_document").get("struktogram")});
                this.helpers = this.model.get("active_document").get("helpers").map(function(helper) {
                    return new CanvasView({'model': helper});
                });
                this.$el.html(this.template({
                    "empty": false,
                    "model": this.model
                }));
                var $canvas_container = this.$el.find(".canvas-container");
                $canvas_container.append(this.struktogram.$el);
                this.struktogram.render();
                this.helpers.forEach(function(helper) {
                    $canvas_container.append(helper.$el);
                    helper.render();
                });
            } else {
                this.$el.html(this.template({
                    "empty": true
                }));
            }
            return this;
        }
    });
    return UICanvasView;
});
