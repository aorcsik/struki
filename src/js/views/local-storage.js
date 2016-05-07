define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization'
], function($, _, Backbone, Localization){
    var LocalStorage = Backbone.View.extend({
        className: "background-notification",

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                for (var i = 0; i < self.model.settings_keys.length; i++) {
                    if (e.changed[self.model.settings_keys[i]] !== undefined) {
                        self.saveUISettings();
                        return;
                    }
                }
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
                this.render("Application settings were saved");
            }
        },
        restoreUISettings: function() {
            var key = this.settings_key,
                value = window.localStorage.getItem(key);
            if (value) {
                try {
                    this.model.setSettings(JSON.parse(value));
                    this.render("Application settings were restored");
                } catch (e) {
                    console.error(e);
                }
            }
        },

        document_prefix: "struki.document.",
        saveDocument: function(doc) {
            if (window.localStorage && JSON.stringify) {
                var key = this.document_prefix + doc.get("uuid"),
                    value = doc.serialize();
                window.localStorage.setItem(key, JSON.stringify(value));
                this.render("Document <%= name %> was autosaved", {'name': "<strong>" + doc.get("name") + "</strong>"});
            }
        },
        removeDocument: function(doc) {
            if (window.localStorage) {
                var key = this.document_prefix + doc.get("uuid");
                window.localStorage.removeItem(key);
                this.render("Document <%= name %> autosave was removed", {'name': "<strong>" + doc.get("name") + "</strong>"});
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
                            var json = JSON.parse(value);
                            this.model.openDocumentFromJSON(json);
                            this.render("Document <%= name %> loaded", {'name': "<strong>" + json.name + "</strong>"});
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
        },

        disappear_timer: null,
        render: function(message, params, delay) {
            var self = this;
            params = $.extend({}, params);
            delay = (delay || 2000) + 300;
            var $message = $("<div>").html(_.template(Localization.gettext(message))(params));
            this.$el.append($message).addClass("visible");
            window.setTimeout(function() {
                $message.fadeOut(function() { $message.remove(); });
            }, delay);
            window.clearTimeout(this.disappear_timer);
            this.disappear_timer = window.setTimeout(function() {
                self.$el.removeClass("visible");
            }, delay);
        }
    });
    return LocalStorage;
});
