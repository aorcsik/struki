define([
    'jquery',
    'underscore',
    'backbone',
    'models/context',
    'models/document',
    'models/function_wrapper'
], function($, _, Backbone, Context, Document, FunctionWrapper) {
    var UI = Backbone.Model.extend({
        defaults: {
            'editor_width':  [300, "px"],
            'output_width':  [ 50, "%" ],
            'output_height': [200, "px"],

            'unsafe': false,
            'step_delay': 500,
            'max_iterations': 10000
        },
        initialize: function() {
            var self = this;
            this.set("open_documents", []);
            this.set("output_buffer", []);
        },

        settings_keys: ['unsafe', 'step_delay', 'max_iterations'],
        getSettings: function() {
            var self = this, settings = {};
            this.settings_keys.forEach(function(key) {
                settings[key] = self.get(key);
            });
            return settings;
        },
        setSettings: function(new_settings) {
            var self = this, settings = {};
            this.settings_keys.forEach(function(key) {
                if (new_settings[key] !== undefined) {
                    settings[key] = new_settings[key];
                }
            });
            this.set(settings);
        },

        newDocument: function(name) {
            var doc = new Document({"ui": this});
            doc.newStruktogram(name || "new");
            this.openDocument(doc);
            return doc;
        },
        openDocumentFromJSON: function(json) {
            var doc = new Document({"ui": this});
            doc.fromJSON(json);
            this.openDocument(doc);
            return doc;
        },
        openDocument: function(doc) {
            var self = this,
                active_doc = this.get("active_document");
            if (active_doc) {
                this.stopListening(active_doc, "change");
            }
            if (doc !== null) {
                var idx = this.get("open_documents").indexOf(doc);
                if (idx < 0) {
                    this.trigger("document_changed", doc);
                    this.get("open_documents").push(doc);
                }
            }
            this.set("active_document", doc);
            this.listenTo(doc, "change", function(e) {
                self.trigger("change", e);
                self.resetContext();
                this.trigger("document_changed", doc);
            });
            this.resetContext();
            return doc;
        },
        closeDocument: function(doc) {
            var idx = this.get("open_documents").indexOf(doc);
            if (idx > -1) {
                this.get("open_documents").splice(idx, 1);
                this.trigger("document_closed", doc);
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
        getEditorWidth: function(max_width, min_width) {
            min_width = min_width || 0;
            max_width = max_width || this.get("window_width");
            return Math.max(min_width, Math.min(max_width - min_width, Math.floor(this.getObjectSize("editor_width", max_width))));
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


        resetContext: function() {
            var self = this,
                functions = {
                    "print": new FunctionWrapper({
                        'func': function() {
                            self.get("output_buffer").push(arguments);
                        }
                    }),
                    "size": new FunctionWrapper({
                        'func': function(arg) {
                            return arg.length;
                        }
                    })
                },
                variables = {};
            if (this.get("active_document")) {
                var struktogram = this.get("active_document").get("struktogram");
                functions[struktogram.get("name")] = struktogram;
                struktogram.get("parameters").forEach(function(parameter) {
                    variables[parameter.get("name")] = null;
                });
            }
            var context = new Context({
                'parent': this,
                'functions': functions,
                'variables': variables
            });
            this.set("context", context);
        },

        run: function(debug_step) {
            var context = this.get("context"),
                struktogram = this.get("active_document").get("struktogram"),
                parameters = [];
            struktogram.get("parameters").forEach(function(parameter) {
                var value = context.get("variables")[parameter.get("name")];
                if (parameter.get("type") == "Int") {
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
            this.trigger("started_run");
            try {
                return this.get("active_document").get("struktogram").evaluate(parameters, context);
            } catch(e) {
                if (e.match && e.match(/^Compile/)) $(".ui-output").data("view").error(e);
                throw e;
            }
        },
        finishRun: function(result) {
            var doc = this.get("active_document");
            doc.set({'_last_run': (new Date()).getTime()});
            this.trigger("finished_run", this.get("context").toString(result));
        },
        clearOutputBuffer: function() {
            this.set("output_buffer", []);
        },
        flushOutput: function() {
            var buffer = this.get("output_buffer");
            this.set("output_buffer", []);
            this.trigger("flush_output", buffer);
        }
    });
    return UI;
});
