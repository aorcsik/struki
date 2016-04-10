    define([
    'jquery',
    'underscore',
    'backbone',
    'models/variable',
    'views/canvas/canvas',
    'text!../../templates/ui-canvas.html'
], function($, _, Backbone, Variable, CanvasView, UICanvasTemplate){
    var UICanvasView = Backbone.View.extend({
        className: "ui-canvas-view",
        events: {
            "click .panel-heading li": "handleSelectTab",
            "click .panel-heading li .close-tab": "handleCloseTab"
        },
        template: _.template(UICanvasTemplate),
        canvas: null,

        initialize: function() {
            var self = this;
            this.canvas = null;
            if (self.model.get("active_document")) {
                this.canvas = new CanvasView({'model': self.model.get("active_document")});
            }
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined) return;
                if (self.canvas) {
                    this.canvas.close();
                }
                self.canvas = null;
                self.render();
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
            if (this.model.get("active_document")) {
                this.canvas = new CanvasView({'model': this.model.get("active_document")});
                this.$el.html(this.template({
                    "empty": false,
                    "model": this.model
                }));
                this.$el.find(".canvas-container").append(this.canvas.$el);
                this.canvas.render();
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
