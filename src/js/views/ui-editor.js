define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'views/editor/struktogram',
    'text!../../templates/ui-editor.html'
], function($, _, Backbone, Localization, EditorStruktogramView, UIEditorTemplate){
    var UIEditorView = Backbone.View.extend({
        className: "ui-editor",
        template: _.template(UIEditorTemplate),
        stuktogram: null,
        helpers: null,
        scrolltop: null,

        initialize: function() {
            var self = this;
            this.scrollto = 0;
            this.struktogram = null;
            this.helpers = [];
            if (this.model.get("active_document")) {
                this.openDocument(this.model.get("active_document"));
            }
            this.listenTo(this.model, "change:context", function(model, value) {
                this.$el.find(".evaluating").removeClass("evaluating");
                this.$el.find(".error").removeClass("error");
            });
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.active_document !== undefined ||
                    e.changed.helpers !== undefined ||
                    e._type !== undefined) {  // structogram element changed
                    if (self.struktogram) {
                        self.struktogram.close();
                        this.helpers.forEach(function(helper) {
                            helper.close();
                        });
                    }
                    self.struktogram = null;
                    self.helpers = [];
                    self.render();
                }
            });

            $(window).on("keyup", function(e) {
                if (e.keyCode == 27) {
                    if ($(".editing form").size() > 0) {
                        $(".editing form")[0].reset();
                        $(".editing").removeClass("editing");
                    }
                }
            });
        },

        onClose: function() {},

        openDocument: function(doc) {
            var self = this;

            if (this.struktogram) this.struktogram.close();
            this.helpers.forEach(function(helper) { helper.close(); });

            this.struktogram = new EditorStruktogramView({'model': doc.get("struktogram")});
            this.helpers = doc.get("helpers").map(function(helper) {
                var helper_view = new EditorStruktogramView({'model': helper});
                return helper_view;
            });
            this.listenTo(doc, "change", function(e) {
                $(".evaluating").removeClass("evaluating");
            });
        },

        render: function() {
            this.$el.html(this.template({
                "L": Localization
            }));
            var self = this,
                $struktogram_container = this.$el.children(".struktogram-container");
            if (this.model.get("active_document")) {
                if (!this.struktogram || this.struktogram.model.cid !== this.model.get("active_document").get("struktogram").cid) {
                    this.openDocument(this.model.get("active_document"));
                }
                $struktogram_container.append(this.struktogram.$el);
                this.struktogram.render();
                this.helpers.forEach(function(helper) {
                    $struktogram_container.append(helper.$el);
                    helper.render();
                });

                var dropdown_delay = null,
                    $dropdown = this.$el.find(".command-dropdown");
                $dropdown.on("mouseover", function() {
                    window.clearTimeout(dropdown_delay);
                }).on("mouseout", function() {
                    dropdown_delay = window.setTimeout(function() {
                        self.$el.find(".command-dropdown").hide();
                    }, 100);
                });
                $dropdown.children("li").on("click", function() {
                    var type = $(this).data("type"),
                        model = $dropdown.data("model");
                    if (type === "command") model.get("sequence").newCommand();
                    else if (type === "loop") model.get("sequence").newLoop();
                    else if (type === "conditional") model.get("sequence").newConditional();
                    else if (type === "branch") model.get("parent").newBranch();
                    else if (type === "helper") model.get('document').newHelper();
                });
            }
            this.updateLayout();
            this.$el.children(".struktogram-container").scrollTop(this.scrolltop);
            this.$el.children(".struktogram-container").on("scroll", function() {
                self.scrolltop = $(this).scrollTop();
            });
            return this;
        },
        updateLayout: function() {
            var toolbar_height = $(".ui-toolbar").outerHeight();
            var editor_width = this.model.getEditorWidth(null, 100);
            this.$el.css({
                'left': 0,
                'bottom': 0,
                'top': toolbar_height,
                'width': editor_width
            });
            this.$el.find(".struktogram-container").css({
                'height': this.$el.height()
            });
        }
    });
    return UIEditorView;
});
