define([
    'jquery',
    'underscore',
    'backbone',
    'models/context',
    'models/document/document'
], function($, _, Backbone, Context, Document) {
    var UI = Backbone.Model.extend({
        defaults: {
            /** Language settings */
            'locale': "en-US",

            /** Layout settings */
            'editor_width':  [25, "%"],
            'output_width':  [50, "%" ],
            'output_height': [25, "%"],
            'canvas_zoom': 100,

            /** Unsafe running flag */
            'unsafe': false,
            /** Timed run step delay */
            'step_delay': 500,
            /** Maximum interations for safe running */
            'max_iterations': 10000,

            /** Open documents container */
            'open_documents': null,
            /** The active document reference */
            'active_document': null,

            /** The global context */
            'context': null,
            /** The output buffer */
            'output_buffer': null,

            /** Future history container */
            'history': null
        },
        initialize: function() {
            var self = this;
            this.set("open_documents", []);
            this.set("output_buffer", []);
            this.set("history", {});
        },

        /** Settings to be exported to local storage */
        settings_keys: ['locale', 'unsafe', 'step_delay', 'max_iterations',
                        'editor_width', 'output_width', 'output_height',
                        'canvas_zoom'],
        /** Returns autosave settings */
        getSettings: function() {
            var self = this, settings = {};
            this.settings_keys.forEach(function(key) {
                settings[key] = self.get(key);
            });
            return settings;
        },
        /** Sets autosave settings */
        setSettings: function(new_settings) {
            var self = this, settings = {};
            this.settings_keys.forEach(function(key) {
                if (new_settings[key] !== undefined) {
                    settings[key] = new_settings[key];
                }
            });
            this.set(settings);
        },

        /** Creates a new document and opens it */
        newDocument: function(name) {
            var doc = new Document({"ui": this});
            this.openDocument(doc);
            return doc;
        },
        /** Opens a document from JSON */
        openDocumentFromJSON: function(json) {
            var doc = new Document({"ui": this});
            doc.deserialize(json);
            this.openDocument(doc);
            return doc;
        },
        /** Opens the parameter document */
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
                    // self.saveHistory(doc);  // TODO: future history function
                    self.trigger("change", e);
                    self.resetContext();
                    self.trigger("document_changed", doc);
                });
            }
            this.set("active_document", doc);
            this.resetContext();
            return doc;
        },
        /** Closes the parameter document */
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

        // TODO: future history function
        saveHistory: function(doc) {
            var uuid = doc.getUUID(),
                newsave = JSON.stringify(doc.serialize()),
                history = $.extend({}, this.get("history"));
            if (history[uuid] && history[uuid].length > 0) {
                var lastsave = history[uuid][0];
                if (lastsave === newsave) return;
            } else {
                history[uuid] = [];
            }
            history[uuid].unshift(newsave);
            if (history[uuid].length > 10) {
                history[uuid] = history[uuid].slice(0, 10);
            }
            this.set("history", history);
        },

        /** Update window size */
        updateWindowSize: function(window_width, window_height) {
            this.set({
                'window_width': window_width,
                'window_height': window_height
            });
        },

        /** Layout getter functions */
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


        /** Resets the global context */
        resetContext: function() {
            var self = this,
                context = new Context({'parent': this});

            context.defineFunction("print", function() {
                self.get("output_buffer").push(arguments);
            });
            context.defineFunction("size", function(arg) { return arg.length; });
            if (this.get("active_document")) {
                var struktogram = this.get("active_document").getStruktogram();
                context.defineFunction(struktogram.getName(), struktogram);
                struktogram.get("parameters").forEach(function(parameter) {
                    context.defineVariable(parameter.getName(), parameter.getType());
                });
                this.get("active_document").getHelpers().forEach(function(helper) {
                    context.defineFunction(helper.getName(), helper);
                });
            }

            this.set("context", context);
        },

        /** Starts the document evaluation */
        run: function(debug_step) {
            var context = this.get("context");
            context.set({"_state": 0, "_debug": debug_step});
            this.trigger("started_run");
            try {
                result = this.get("active_document").evaluate(context);
                return result;
            } catch(e) {
                if (context.isError(e)) $(".ui-output").data("view").error(e);
                throw e;
            }
        },

        /** Called when the evaluation is over */
        finishRun: function(result) {
            var doc = this.get("active_document");
            doc.set({'_last_run': (new Date()).getTime()});
            this.trigger("finished_run", this.get("context").asString(result));
        },

        /** Empties output buffer */
        clearOutputBuffer: function() {
            this.set("output_buffer", []);
        },

        /** Flushes output buffer */
        flushOutput: function() {
            var buffer = this.get("output_buffer");
            this.set("output_buffer", []);
            this.trigger("flush_output", buffer);
        }
    });
    return UI;
});
