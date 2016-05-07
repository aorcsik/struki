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
            'locale': "en-US",

            'editor_width':  [25, "%"],
            'output_width':  [50, "%" ],
            'output_height': [25, "%"],

            'unsafe': false,
            'step_delay': 500,
            'max_iterations': 10000
        },
        initialize: function() {
            var self = this;
            this.set("open_documents", []);
            this.set("output_buffer", []);
        },

        settings_keys: ['locale', 'unsafe', 'step_delay', 'max_iterations', 'editor_width', 'output_width', 'output_height'],
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
            this.openDocument(doc);
            return doc;
        },
        openDocumentFromJSON: function(json) {
            var doc = new Document({"ui": this});
            doc.deserialize(json);
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
                this.listenTo(doc, "change", function(e) {
                    // console.log("document -> ui", e);
                    self.trigger("change", e);
                    self.resetContext();
                    this.trigger("document_changed", doc);
                });
            }
            this.set("active_document", doc);
            this.resetContext();
            return doc;
        },
        closeDocument: function(doc) {
            var open_documents = this.get("open_documents").map(function(doc) { return doc; }),
                idx = open_documents.indexOf(doc);
            if (idx > -1) {
                open_documents.splice(idx, 1);
                this.set("open_documents", open_documents);
                this.trigger("document_closed", doc);

                if (this.get("active_document") === doc) {
                    if (this.get("open_documents").length === 0) {
                        this.openDocument(null);
                    } else if (this.get("open_documents").length === idx) {
                        this.openDocument(this.get("open_documents")[idx - 1]);
                    } else {
                        this.openDocument(this.get("open_documents")[idx]);
                    }
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
                types = {},
                variables = {};
            if (this.get("active_document")) {
                var struktogram = this.get("active_document").get("struktogram");
                functions[struktogram.get("name")] = struktogram;
                struktogram.get("parameters").forEach(function(parameter) {
                    variables[parameter.get("name")] = null;
                    types[parameter.get("name")] = parameter.get("type");
                });
                this.get("active_document").get("helpers").forEach(function(helper) {
                    functions[helper.get("name")] = helper;
                });
            }
            var context = new Context({
                'parent': this,
                'functions': functions,
                'types': types,
                'variables': variables
            });
            this.set("context", context);
        },

        run: function(debug_step) {
            var context = this.get("context");
            context.set({"_state": 0, "_debug": debug_step});
            this.trigger("started_run");
            try {
                result = this.get("active_document").evaluate(context);
                return result;
            } catch(e) {
                if (e.match && e.match(/^(Compile|Syntax)/)) $(".ui-output").data("view").error(e);
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
