define([
    'jquery',
    'underscore',
    'backbone',
    'models/context'
], function($, _, Backbone, Context) {
    var UI = Backbone.Model.extend({
        defaults: {
            'browser_width':  [300, "px"],
            'output_width':   [ 50, "%" ],
            'output_height':  [200, "px"]
        },
        initialize: function() {
            var self = this;
            this.set("open_documents", []);
        },
        openDocument: function(doc) {
            var self = this;
            if (doc !== null) {
                var idx = this.get("open_documents").indexOf(doc);
                if (idx < 0) {
                    this.get("open_documents").push(doc);
                    this.listenTo(doc.get("struktogram"), "change", function() {
                        self.resetContext();
                    });
                }
            }
            this.set("active_document", doc);
            this.resetContext();
        },
        resetContext: function() {
            var functions = {}, variables = {},
                struktogram = this.get("active_document").get("struktogram");
            functions[struktogram.get("name")] = struktogram;
            struktogram.get("parameters").forEach(function(parameter) {
                variables[parameter.get("name")] = null;
            });
            this.set("context", new Context({
                'functions': functions,
                'variables': variables
            }));
        },
        closeDocument: function(doc) {
            var idx = this.get("open_documents").indexOf(doc);
            if (idx > -1) {
                this.get("open_documents").splice(idx, 1);
                if (this.get("active_document") === doc) {
                    if (this.get("open_documents").length === 0) {
                        this.openDocument(null);
                    } else if (this.get("open_documents").length === idx) {
                        this.openDocument(this.get("open_documents")[idx - 1]);
                    } else {
                        this.openDocument(this.get("open_documents")[idx]);
                    }
                } else {
                    this.trigger("change", this);
                }
            }

        },
        updateWindowSize: function(window_width, window_height) {
            this.set({
                'window_width': window_width,
                'window_height': window_height
            });
        },
        getWindowWidth: function() {
            return this.get("window_width");
        },
        getWindowHeight: function() {
            return this.get("window_height");
        },
        getBrowserWidth: function(max_width, min_width) {
            min_width = min_width || 0;
            max_width = max_width || this.get("window_width");
            return Math.max(min_width, Math.min(max_width - min_width, Math.floor(this.getObjectSize("browser_width", max_width))));
        },
        getOutputWidth: function(max_width, min_width) {
            min_width = min_width || 0;
            max_width = max_width || this.get("window_width");
            return Math.max(min_width, Math.min(max_width - min_width, Math.floor(this.getObjectSize("output_width", max_width))));
        },
        getOutputHeight: function(max_height) {
            return this.getObjectSize("output_height", max_height || this.get("window_height"));
        },
        getObjectSize: function(object_size, max_size) {
            if (this.get(object_size)[1] === "px")
                return this.get(object_size)[0];
            else if (this.get(object_size)[1] === "%")
                return this.get(object_size)[0] / 100 * max_size;
        },

        runStruktogram: function(debug_step) {
            var context = this.get("context"),
                struktogram = this.get("active_document").get("struktogram"),
                parameters = [];
            struktogram.get("parameters").forEach(function(parameter) {
                var value = context.get("variables")[parameter.get("name")];
                if (value === "") {
                    value = null;
                } else if (parameter.get("type") == "Int") {
                    value = parseInt(value, 10);
                } else if (parameter.get("type") == "Bool") {
                    if (value === "I") value = true;
                    else if (value == "H") value = false;
                    else value = Boolean(value);
                } else if (parameter.get("type") == "Float") {
                    value = parseFloat(value);
                }
                parameters.push(value);
            });
            context.set({"_state": 0, "_debug": debug_step});
            try {
                this.get("active_document").get("struktogram").evaluate(parameters, context);
            } catch(e) {
                if (e.match(/^Compile/)) $("#output").data("view").error(e);
            }
        }

    });
    return UI;
});
