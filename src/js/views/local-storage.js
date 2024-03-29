define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization'
], function($, _, Backbone, Localization){
    var LocalStorage = Backbone.View.extend({
        disabled: true,
        className: "background-notification",

        initialize: function() {
            var self = this;
            if (window.localStorage && JSON && JSON.stringify && JSON.parse) {
                this.disabled = false;

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
            }
        },

        settings_key: "struki.settings",
        saveUISettings: function() {
            if (this.disabled) return;
            try {
                var self = this,
                    key = this.settings_key,
                    value = this.model.getSettings();
                window.localStorage.setItem(key, JSON.stringify(value));
                self.render("Application settings were saved");
            } catch(e) {
                this.render("Application settings save is not possible (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning", 5000);
            }
        },
        restoreUISettings: function() {
            if (this.disabled) return;
            var key = this.settings_key,
                value = window.localStorage.getItem(key);
            if (value) {
                try {
                    this.model.setSettings(JSON.parse(value));
                    this.render("Application settings were restored");
                } catch (e) {
                    this.render("Application settings restore failed (<%= error %>)", {'error': "<em>" + e + "</em>"}, "error", 5000);
                }
            }
        },

        document_prefix: "struki.document.",
        saveDocument: function(doc) {
            if (this.disabled) return;
            try {
                var key = this.document_prefix + doc.getUUID() + "-" + doc.cid;
                var value = doc.serialize();
                    window.localStorage.setItem(key, JSON.stringify(value));
                    this.render("Document <%= name %> was autosaved", {'name': "<strong>" + doc.getName() + "</strong>"});
            } catch(e) {
                this.render("Document autosave is not possible (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning", 5000);
            }
        },
        removeDocument: function(doc) {
            if (this.disabled) return;
            try {
                var key = this.document_prefix + doc.getUUID() + "-" + doc.cid;
                if (window.localStorage.getItem(key)) {
                    window.localStorage.removeItem(key);
                    this.render("Document <%= name %> autosave was removed", {'name': "<strong>" + doc.getName() + "</strong>"});
                }
            } catch(e) {
                this.render("Document autosave could not be removed (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning", 5000);
            }
        },
        restoreDocuments: function() {
            if (this.disabled) return;
            var i, key, value, json, documents = [];
            for (i = 0; i < window.localStorage.length; i++) {
                try {
                    key = window.localStorage.key(i);
                    if (key.substring(0, this.document_prefix.length) === this.document_prefix) {
                        documents.push(key);
                    }
                } catch (exc) {
                    this.render("Document autosave load failed (<%= error %>)", {'error': "<em>" + exc + "</em>"}, "error", 5000);
                }
            }
            for (i = 0; i < documents.length; i++) {
                try {
                    key = documents[i];
                    value = window.localStorage.getItem(key);
                    json = JSON.parse(value);
                    window.localStorage.removeItem(key);
                    this.model.openDocumentFromJSON(json);
                    this.render("Document <%= name %> autosave was loaded", {'name': "<strong>" + json.name + "</strong>"});
                } catch (exc) {
                    this.render("Document autosave load failed (<%= error %>)", {'error': "<em>" + exc + "</em>"}, "error", 5000);
                }
            }
        },

        message_repeat_timer: {},
        disappear_timer: null,
        render: function(template_message, params, type, delay) {
            var self = this;
            delay = (delay || 2000) + 300;
            params = $.extend({}, params);
            var html_message = _.template(Localization.gettext(template_message))(params),
                text_message = _.template(Localization.gettext(template_message, true))(params).replace(/<[^<>]+?>/g, "");
            window.clearTimeout(this.message_repeat_timer[text_message]);
            this.message_repeat_timer[text_message] = window.setTimeout(function() {
                var $message;
                if (type == "error") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE000;</i>" + html_message).addClass("text-danger");
                    console.error(text_message);
                } else if (type == "warning") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE002;</i>" + html_message).addClass("text-warning");
                    console.warn(text_message);
                } else {
                    $message = $("<div>").html("<i class='material-icons'>&#xE876;</i>" + html_message);
                    console.log(text_message);
                }
                self.$el.append($message).addClass("visible");
                window.setTimeout(function() {
                    $message.fadeOut(function() { $message.remove(); });
                }, delay - 200);
                window.clearTimeout(self.disappear_timer);
                self.disappear_timer = window.setTimeout(function() {
                    self.$el.removeClass("visible");
                }, delay);
            }, 200);
        }
    });
    return LocalStorage;
});
