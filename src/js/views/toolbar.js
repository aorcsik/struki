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
        },

        newDocument: function() {
            var doc = new Document();
            doc.newStruktogram("new");
            this.model.openDocument(doc);
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return ToolbarView;
});
