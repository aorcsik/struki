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

        handleEditName: function(e) {
            var doc_cid = $(e.target).closest("li").data("cid");
            this.render(doc_cid);
            return false;
        },

        handleSaveName: function(e) {
            var self = this;
                doc_cid = $(e.target).closest("li").data("cid"),
                new_name = $(e.target).closest("li").find("input[name='name']").val().replace(/^\s+|\s+$/, "");
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
            this.model.get("open_documents").forEach(function(doc) {
                if (doc.cid === doc_cid) self.model.openDocument(doc);
            });
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
                this.helpers.forEach(function(helper) {
                    $canvas_container.append(helper.$el);
                    helper.render();
                });
            } else {
                this.$el.html(this.template({
                    "empty": true,
                    "L": Localization
                }));
            }
            return this;
        }
    });
    return UICanvasView;
});
