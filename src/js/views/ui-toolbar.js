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
            "click .open-example": "openExample",
            "change #open_docuemnt_input": "handleOpenDocument"
        },
        template: _.template(UIToolbarTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined) return;
                self.render();
            });

            window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
            navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
        },

        newDocument: function() {
            this.model.newDocument("new");
        },

        openDocumentDialog: function(e) {
            $(e.target).closest("li").find("input").click();
        },

        openExample: function(e) {
            e.preventDefault();

            var self = this
            var exampleJSONPath = $(e.target).closest("a").attr("href");
            $.getJSON(exampleJSONPath, function(result) {
                self.model.openDocumentFromJSON(result);
            });
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
            return new Blob([JSON.stringify(json)], {type: 'application/json'});
        },

        CanvastoDataURI: function(canvas, contentType) {
            return canvas.toDataURL(contentType);
        },

        CanvastoBlob: function(canvas, contentType, sliceSize) {
            contentType = contentType || 'image/png';
            sliceSize = sliceSize || 512;
            var byteCharacters = atob(canvas.toDataURL(contentType).replace("data:" + contentType + ";base64,", ""));
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            return new Blob(byteArrays, {type: contentType});
        },

        getJSONDownalodLink: function(text) {
            var self = this,
                json = this.model.get("active_document").serialize(),
                filename = this.model.get("active_document").getName() + ".json";
            if (Blob !== undefined && navigator.saveBlob) {
                return $("<a id='json_download'>" + text + " " + filename + "</a>").attr({
                    "href": "#",
                    "target": "_blank",
                    "download": filename
                }).on("click", function() {
                    navigator.saveBlob(self.JSONtoBlob(json), filename);
                    return false;
                });
            } else if (Blob !== undefined && window.URL.createObjectURL) {
                return $("<a id='json_download'>" + text + " " + filename + "</a>").attr({
                    "href": window.URL.createObjectURL(this.JSONtoBlob(json)),
                    "target": "_blank",
                    "download": filename
                });
            } else  {
                return $("<a id='json_download'>" + text + " " + filename +"</a>").attr({
                    "href": this.JSONtoDataURI(json),
                    "target": "_blank",
                    "download": filename
                });
            }
        },

        getPNGDownloadLinks: function(text) {
            var self = this,
                links = [];
            $(".ui-canvas canvas").each(function() {
                var canvas = $(this)[0],
                    filename = $(this).data("name") + ".png";
                if (Blob !== undefined && navigator.saveBlob) {
                    links.push($("<a id='png_download'>" + text + " " + filename + "</a>").attr({
                        'href': "#",
                    }).on("click", function() {
                        navigator.saveBlob(self.CanvastoBlob(canvas, "image/png"), filename);
                        return false;
                    }));
                } else if (Blob !== undefined && window.URL.createObjectURL) {
                    links.push($("<a id='json_download'>" + text + " " + filename + "</a>").attr({
                        "href": window.URL.createObjectURL(self.CanvastoBlob(canvas, "image/png")),
                        "target": "_blank",
                        "download": filename
                    }));
                } else {
                    links.push($("<a id='png_download'>" + text + " " + filename + "</a>").attr({
                        "href": self.CanvastoDataURI(canvas, "image/png"),
                        "target": "_blank",
                        "download": filename
                    }));
                }
            });
            return links;
        },

        updateSaveLinks: function() {
            if (this.model.get("active_document")) {
                var self = this,
                    $menu = this.$el.find(".save-dropdown-menu");
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
