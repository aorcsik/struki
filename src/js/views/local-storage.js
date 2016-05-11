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
        },

        settings_save_timer: null,
        settings_key: "struki.settings",
        saveUISettings: function() {
            try {
                var self = this,
                    key = this.settings_key,
                    value = this.model.getSettings();
                window.clearTimeout(this.settings_save_timer);
                this.settings_save_timer = window.setTimeout(function() {
                    window.localStorage.setItem(key, JSON.stringify(value));
                    self.render("Application settings were saved");
                }, 100);
            } catch(e) {
                this.render("Application settings save is not possible (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning");
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
                    this.render("Application settings restore failed (<%= error %>)", {'error': "<em>" + e + "</em>"}, "error");
                }
            }
        },

        document_prefix: "struki.document.",
        saveDocument: function(doc) {
            try {
                var key = this.document_prefix + doc.get("uuid");
                var value = doc.serialize();
                    window.localStorage.setItem(key, JSON.stringify(value));
                    this.render("Document <%= name %> was autosaved", {'name': "<strong>" + doc.get("name") + "</strong>"});
            } catch(e) {
                this.render("Document autosave is not possible (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning");
            }
        },
        removeDocument: function(doc) {
            if (window.localStorage) {
                var key = this.document_prefix + doc.get("uuid");
                if (window.localStorage.getItem(key)) {
                    window.localStorage.removeItem(key);
                    this.render("Document <%= name %> autosave was removed", {'name': "<strong>" + doc.get("name") + "</strong>"});
                }
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
                            this.render("Document <%= name %> autosave was loaded", {'name': "<strong>" + json.name + "</strong>"});
                        } catch (e) {
                            this.render("Document autosave load failed (<%= error %>)", {'error': "<em>" + e + "</em>"}, "error");
                        }
                    }
                }
            }
        },

        message_repeat_timer: {},
        disappear_timer: null,
        render: function(message, params, type, delay) {
            var self = this;
            delay = (delay || 2000) + 300;
            params = $.extend({}, params);
            message = _.template(Localization.gettext(message))(params);
            window.clearTimeout(this.message_repeat_timer[message]);
            this.message_repeat_timer[message] = window.setTimeout(function() {
                var $message = $("<div>").html("<i class='material-icons'>&#xE876;</i>" + message);
                if (type == "error") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE000;</i>" + message).addClass("text-danger");
                }
                if (type == "warning") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE002;</i>" + message).addClass("text-warning");
                }
                self.$el.append($message).addClass("visible");
                window.setTimeout(function() {
                    $message.fadeOut(function() { $message.remove(); });
                }, delay - 200);
                window.clearTimeout(self.disappear_timer);
                self.disappear_timer = window.setTimeout(function() {
                    self.$el.removeClass("visible");
                }, delay);
            }, 50);
        }
    });
    return LocalStorage;
});
