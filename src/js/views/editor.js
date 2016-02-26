    define([
    'jquery',
    'underscore',
    'backbone',
    'models/variable',
    'views/canvas/canvas',
    'text!../../templates/editor.html'
], function($, _, Backbone, Variable, CanvasView, editorTemplate){
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

            /* var doc = this.model.newDocument();
            doc.newStruktogram("struki");
            doc.get("struktogram").set("parameters", [new Variable({'name': "a", 'type': "Int"})]);
            doc.get("struktogram").set("variables", [new Variable({'name': "x", 'type': "Int"})]);
            doc.get("struktogram").get("sequence").removeCommandByIndex(0);
            doc.get("struktogram").get("sequence").newCommand({'code': "x:=3"});
            // doc.get("struktogram").get("sequence").newCommand({'code': "y:=4+5-6"});

            var conditional = doc.get("struktogram").get("sequence").newConditional();
            conditional.get("else_branch").get("sequence").newCommand({'code': "x:=x-1"});
            conditional.get("branches")[0].set("condition", "x = 1");
            conditional.get("branches")[0].get("sequence").newCommand({'code': "x:=x+1"});
            conditional.get("branches")[0].get("sequence").newCommand({'code': "x:=x+1"});
            var branch = conditional.newBranch({'condition': "x = 1"});
            branch.set("condition", "x = 1");
            branch.get("sequence").newCommand({'code': "x:=x+1+2"});

            var loop = doc.get("struktogram").get("sequence").newLoop({'condition': "a < 2"});
            loop.get("sequence").newCommand({'code': "a:=a+1"});
            loop.get("sequence").newCommand({'code': "print(a)"});


            var doc2 = this.model.newDocument();
            doc2.newStruktogram("struki2");

            window.setTimeout(function() {
                self.model.openDocument(doc2);
            }, 250);
            window.setTimeout(function() {
                self.model.openDocument(doc);
            }, 500); */

            this.canvas = null;
            if (self.model.get("active_document")) {
                this.canvas = new CanvasView({'model': self.model.get("active_document")});
            }
            this.listenTo(this.model, "change", function(e) {
                // if (e.changed.active_document === undefined) return;
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
    return EditorView;
});
