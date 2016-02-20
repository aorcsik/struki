define([
    'jquery',
    'underscore',
    'backbone',
    'models/document',
    'text!../../templates/toolbar.html'
], function($, _, Backbone, Document, toolbarTemplate){
    var ToolbarView = Backbone.View.extend({
        id: "toolbar",
        className: "navbar navbar-inverse",
        events: {
            "click #new_document": "newDocument"
        },
        template: _.template(toolbarTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined) return;
                self.render();
            });
        },

        newDocument: function() {
            var doc = new Document();
            doc.newStruktogram("new");
            this.model.openDocument(doc);
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({
                "model": this.model
            }));
            return this;
        }
    });
    return ToolbarView;
});
