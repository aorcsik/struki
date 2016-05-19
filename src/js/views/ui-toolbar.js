define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'views/ui-settings',
    'text!../../templates/ui-toolbar.html'
], function($, _, Backbone, Localization, UISettingsView, UIToolbarTemplate){
    var UIToolbarView = Backbone.View.extend({
        className: "ui-toolbar navbar navbar-inverse",
        events: {
            "click #new_document": "newDocument",
            "click #open_document": "openDocumentDialog",
            "click #save_dropdown": "updateSaveLinks",
            "click #run_struktogram": "run",
            "click #nav_settings": "openSettings",
            "change #open_docuemnt_input": "handleOpenDocument"
        },
        template: _.template(UIToolbarTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined) return;
                self.render();
            });
        },

        newDocument: function() {
            this.model.newDocument("new");
        },

        openDocumentDialog: function(e) {
            $(e.target).closest("li").find("input").click();
        },

        handleOpenDocument: function(e) {
            this.openDocument(e.target.files);
        },

        openDocument: function(files) {
            var self = this,
                reader = new FileReader();
            reader.onload = function(read_event) {
                try {
                    self.model.openDocumentFromJSON(JSON.parse(read_event.target.result));
                } catch (e) {
                    self.trigger("background_notification", {
                        'message': "Failed to open document (<%= error %>)",
                        'type': "error",
                        'params': {'error': "<em>" + e + "</em>"}
                    });
                }
            };
            reader.readAsText(files[0]);
        },

        openSettings: function() {
            var settings = new UISettingsView({'model': this.model});
            settings.$el.appendTo($("body"));
            settings.render();
        },

        onClose: function() {},

        // https://developer.mozilla.org/en/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
        b64EncodeUnicode: function(str) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        },

        JSONtoDataURI: function(json) {
            return 'data:application/json;charset-utf-8;base64,' + this.b64EncodeUnicode(JSON.stringify(json));
        },

        JSONtoBlob: function(json) {
            return new Blob([JSON.stringify(json)]);
        },

        getJSONDownalodLink: function(text) {
            var json = this.model.get("active_document").serialize(),
                filename = this.model.get("active_document").getName() + ".json";
            if (navigator.msSaveBlob) {
                var blob = this.JSONtoBlob(json);
                return $("<a id='json_download' href='javascript:void(0);'>" + text + " " + filename + "</a>").on("click", function() {
                    navigator.msSaveBlob(blob, filename);
                });
            } else {
                var datauri = this.JSONtoDataURI(json);
                return $("<a id='json_download' href='" + datauri + "' target='_blank' download='" + filename + "'>" + text + " " + filename +"</a>");
            }
        },

        getPNGDownloadLinks: function(text) {
            var links = [];
            $(".ui-canvas canvas").each(function() {
                var img = $(this)[0].toDataURL("image/png"),
                    filename = $(this).data("name") + ".png";
                if (navigator.msSaveBlob) {
                    var blob = b64toBlob(image.replace("data:image/png;base64,",""),"image/png");
                    links.push($("<a id='png_download' href='javascript:void(0);'>" + text + " " + filename + "</a>").on("click", function() {
                        navigator.msSaveBlob(blob, filename);
                    }));
                } else {
                    links.push($("<a id='png_download' href='" + img + "' target='_blank' download='" + filename + "'>" + text + " " + filename + "</a>"));
                }
            });
            return links;
        },

        updateSaveLinks: function() {
            if (this.model.get("active_document")) {
                var self = this,
                    $menu = this.$el.find(".dropdown-menu");
                $menu.find("li").remove();
                $menu.append($("<li>").append(this.getJSONDownalodLink('<i class="material-icons">&#xE86F;</i>')));
                $menu.append($("<li class='divider'></li>"));
                // $menu.append($("<li class='dropdown-header'>Dropdown header</li>"));
                this.getPNGDownloadLinks('<i class="material-icons">&#xE3F4;</i>').forEach(function(link) {
                    $menu.append($("<li>").append(link));
                });
            }
        },

        run: function() {
            $(".ui-watcher").data("view").run();
        },

        render: function() {
            this.$el.html(this.template({
                "L": Localization,
                "model": this.model,
            }));
            return this;
        }
    });
    return UIToolbarView;
});
