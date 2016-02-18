define([
    'jquery',
    'underscore',
    'backbone',
    'models/loop',
    'models/command',
    'models/condition',
    'models/branching',
    'models/document',
    'views/canvas/canvas',
    'text!../../templates/editor.html'
], function($, _, Backbone, Loop, Command, Condition, Branching, Document, CanvasView, editorTemplate){
    var EditorView = Backbone.View.extend({
        id: "editor",
        events: {
            "click .panel-heading li": "handleSelectTab",
            "click .panel-heading li .close-tab": "handleCloseTab"
        },
        template: _.template(editorTemplate),
        canvas: null,

        initialize: function() {
            var self = this;
            var doc = new Document();
            doc.newStruktogram("struki");
            doc.get("struktogram").get("sequence").removeCommandByIndex(0);
            doc.get("struktogram").get("sequence").addCommand(new Command({'code': "x:=3"}));
            doc.get("struktogram").get("sequence").addCommand(new Command({'code': "y:=4+5-6"}));
            var loop = new Loop({'condition': new Condition({'code': "a < 2"})});
            loop.get("sequence").addCommand(new Command({'code': "a:=a+1"}));
            var branching = new Branching();
            branching.get("branches")[0].set("condition", new Condition({'code': "x = 1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("else_branch").get("sequence").addCommand(new Command({'code': "x:=x-1"}));
            doc.get("struktogram").get("sequence").addCommand(branching);
            doc.get("struktogram").get("sequence").addCommand(loop);

            this.model.openDocument(doc);

            var doc2 = new Document();
            doc2.newStruktogram("struki2");

            this.model.openDocument(doc2);

            this.canvas = null;
            if (self.model.get("active_document")) {
                this.canvas = new CanvasView({'model': self.model.get("active_document")});
            }
            this.listenTo(this.model, "change", function() {
                this.canvas = null;
                if (self.model.get("active_document")) {
                    self.canvas = new CanvasView({'model': self.model.get("active_document")});
                }
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
            if (this.canvas) {
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
    return EditorView;
});
