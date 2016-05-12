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

        settings_key: "struki.settings",
        saveUISettings: function() {
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
            try {
                var key = this.document_prefix + doc.get("uuid");
                var value = doc.serialize();
                    window.localStorage.setItem(key, JSON.stringify(value));
                    this.render("Document <%= name %> was autosaved", {'name': "<strong>" + doc.get("name") + "</strong>"});
            } catch(e) {
                this.render("Document autosave is not possible (<%= error %>)", {'error': "<em>" + e + "</em>"}, "warning", 5000);
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
                            this.render("Document autosave load failed (<%= error %>)", {'error': "<em>" + e + "</em>"}, "error", 5000);
                        }
                    }
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
                text_message = _.template(Localization.gettext(template_message, true))(params).replace(/<.*?>/g, "");
            window.clearTimeout(this.message_repeat_timer[text_message]);
            this.message_repeat_timer[text_message] = window.setTimeout(function() {
                var $message;
                if (type == "error") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE000;</i>" + html_message).addClass("text-danger");
                    console.error(text_message);
                } else if (type == "warning") {
                    $message = $("<div>").html("<i class='material-icons'>&#xE002;</i>" + html_message).addClass("text-warning");
                    console.warning(text_message);
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
