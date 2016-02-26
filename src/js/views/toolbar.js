define([
    'jquery',
    'underscore',
    'backbone',
    'models/document',
    'text!../../templates/toolbar.html'
], function($, _, Backbone, Document, toolbarTemplate){
    var ToolbarView = Backbone.View.extend({
        id: "toolbar",
        className: "navbar navbar-inverse",
        events: {
            "click #new_document": "newDocument",
            "click #open_document": "openDocumentDialog",
            "click #save_dropdown": "updateSaveLinks",
            "click #run_struktogram": "run",
            "change #open_docuemnt_input": "openDocument"
        },
        template: _.template(toolbarTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document === undefined) return;
                self.render();
            });
        },

        newDocument: function() {
            var doc = new Document();
            doc.newStruktogram("new");
            this.model.openDocument(doc);
        },

        openDocumentDialog: function(e) {
            $(e.target).closest("li").find("input").click();
        },

        openDocument: function(e) {
            var self = this;
            var files = e.target.files;
            var reader = new FileReader();
            reader.onload = function(read_event) {
                var doc = new Document();
                    doc.fromJSON(JSON.parse(read_event.target.result));
                self.model.openDocument(doc);
            };
            reader.readAsText(files[0]);
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

        getJSONDownalodLink: function() {
            var json = this.model.get("active_document").toJSON(),
                filename = this.model.get("active_document").get("struktogram").get("name") + ".json";
            if (navigator.msSaveBlob) {
                var blob = this.JSONtoBlob(json);
                return $("<a id='json_download' href='javascript:void(0);'>JSON</a>").on("click", function() {
                    navigator.msSaveBlob(blob, filename);
                });
            } else {
                var datauri = this.JSONtoDataURI(json);
                return $("<a id='json_download' href='" + datauri + "' target='_blank' download='" + filename + "'>JSON</a>");
            }
        },

        getPNGDownloadLink: function() {
            var img = $("#editor canvas")[0].toDataURL("image/png"),
                filename = this.model.get("active_document").get("struktogram").get("name") + ".png";
            if (navigator.msSaveBlob) {
                var blob = b64toBlob(image.replace("data:image/png;base64,",""),"image/png");
                return $("<a id='png_download' href='javascript:void(0);'>PNG</a>").on("click", function() {
                    navigator.msSaveBlob(blob, filename);
                });
            } else {
                return $("<a id='png_download' href='" + img + "' target='_blank' download='" + filename + "'>PNG</a>");
            }
        },

        updateSaveLinks: function() {
            if (this.model.get("active_document")) {
                console.log("xx");
                $("#json_download").replaceWith(this.getJSONDownalodLink());
                $("#png_download").replaceWith(this.getPNGDownloadLink());
            }
        },

        run: function() {
            $("#watcher").data("view").run();
        },

        render: function() {
            this.$el.html(this.template({
                "model": this.model,
            }));
            return this;
        }
    });
    return ToolbarView;
});
