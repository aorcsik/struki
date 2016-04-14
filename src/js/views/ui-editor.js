define([
    'jquery',
    'underscore',
    'backbone',
    'views/editor/struktogram',
    'text!../../templates/ui-editor.html'
], function($, _, Backbone, EditorStruktogramView, UIEditorTemplate){
    var UIEditorView = Backbone.View.extend({
        className: "ui-editor",
        events: {
            "click .remove-helper": "removeHelper",
            "click .close-struktogram": "closeDocument"
        },
        template: _.template(UIEditorTemplate),
        stuktogram: null,
        helpers: null,

        initialize: function() {
            var self = this;
            this.struktogram = null;
            this.helpers = [];
            if (this.model.get("active_document")) {
                this.openDocument(this.model.get("active_document"));
            }
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined &&
                    e.changed.context === undefined &&
                    e.changed.helpers === undefined) return;
                if (self.struktogram) {
                    self.struktogram.close();
                    this.helpers.forEach(function(helper) {
                        helper.close();
                    });
                }
                self.struktogram = null;
                self.helpers = [];
                self.render();
            });
        },

        onClose: function() {},

        removeHelper: function(e) {
            var helper = $(e.target).closest(".struktogram").data("view").model;
            this.model.get("active_document").removeHelperStruktogram(helper);
            return false;
        },

        closeDocument: function() {
            this.model.closeDocument(this.model.get("active_document"));
            return false;
        },

        openDocument: function(doc) {
            var self = this;
            this.struktogram = new EditorStruktogramView({'model': doc.get("struktogram")});
            this.helpers = doc.get("helpers").map(function(helper) {
                return new EditorStruktogramView({'model': helper});
            });
            this.listenTo(doc, "change", function(e) {
                $(".evaluating").removeClass("evaluating");
            });
        },

        render: function() {
            this.$el.html(this.template({}));
            var self = this,
                $struktogram_container = this.$el.children(".struktogram-container");
            if (this.model.get("active_document")) {
                this.openDocument(this.model.get("active_document"));
                $struktogram_container.append(this.struktogram.$el);
                this.struktogram.render();
                this.helpers.forEach(function(helper) {
                    $struktogram_container.append(helper.$el);
                    helper.render();
                });
            }
            return this;
        }
    });
    return UIEditorView;
});
