define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone, Sequence) {
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
            var idx = this.get("open_documents").indexOf(doc);
            if (idx < 0) this.get("open_documents").push(doc);
            this.set("active_document", doc);
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
        }

    });
    return UI;
});
