define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var LocalStorage = Backbone.View.extend({
        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                self.saveUISettings();
            });
            this.listenTo(this.model, "document_changed", function(doc) {
                self.saveDocument(doc);
            });
            this.listenTo(this.model, "document_closed", function(doc) {
                self.removeDocument(doc);
            });
            this.restoreUISettings();
            this.restoreDocuments();
        },

        settings_key: "struki.settings",
        saveUISettings: function() {
            if (window.localStorage && JSON.stringify) {
                var key = this.settings_key,
                    value = this.model.getSettings();
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        },
        restoreUISettings: function() {
            var key = this.settings_key,
                value = window.localStorage.getItem(key);
            if (value) {
                try {
                    this.model.setSettings(JSON.parse(value));
                } catch (e) {
                    console.error(e);
                }
            }
        },

        document_prefix: "struki.document.",
        saveDocument: function(doc) {
            if (window.localStorage && JSON.stringify) {
                var key = this.document_prefix + doc.cid,
                    value = doc.serialize();
                window.localStorage.setItem(key, JSON.stringify(value));
            }
        },
        removeDocument: function(doc) {
            if (window.localStorage) {
                var key = this.document_prefix + doc.cid;
                window.localStorage.removeItem(key);
            }
        },
        restoreDocuments: function() {
            if (window.localStorage && JSON.parse) {
                for (var i = 0; i < window.localStorage.length; i++) {
                    var key = window.localStorage.key(i),
                        value = window.localStorage.getItem(key);
                    if (key.substring(0, this.document_prefix.length) === this.document_prefix) {
                        window.localStorage.removeItem(key);
                        try {
                            this.model.openDocumentFromJSON(JSON.parse(value));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        }
    });
    return LocalStorage;
});
