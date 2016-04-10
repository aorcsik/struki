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
            "click .close-struktogram": "closeDocument"
        },
        template: _.template(UIEditorTemplate),
        stuktogram: null,

        initialize: function() {
            var self = this;
            this.struktogram = null;
            if (this.model.get("active_document")) {
                this.openDocument(this.model.get("active_document"));
            }
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined && e.changed.context === undefined) return;
                if (self.struktogram) {
                    self.struktogram.close();
                }
                self.struktogram = null;
                self.render();
            });
        },

        onClose: function() {},

        closeDocument: function() {
            this.model.closeDocument(this.model.get("active_document"));
            return false;
        },

        openDocument: function(doc) {
            this.struktogram = new EditorStruktogramView({'model': doc.get("struktogram")});
            this.listenTo(doc, "change", function(e) {
                $(".evaluating").removeClass("evaluating");
            });
        },

        render: function() {
            this.$el.html(this.template({

            }));
            if (this.model.get("active_document")) {
                this.openDocument(this.model.get("active_document"));
                this.$el.children(".struktogram-container").append(this.struktogram.$el);
                this.struktogram.render();
            }
            return this;
        }
    });
    return UIEditorView;
});
