define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'views/editor/sequence',
    'interfaces/editable',
    'text!../../../templates/editor/variable.html',
    'text!../../../templates/editor/struktogram.html'
], function($, _, Backbone, Localization, EditorSequenceView, Editable, editorVariableTemplate, editorStruktogramTemplate){
    var EditorStruktogramView = Backbone.View.extend(Editable).extend({
        className: "struktogram",
        main_sequence: null,
        template: _.template(editorStruktogramTemplate),
        vartemp: _.template(editorVariableTemplate),
        events: {
            "click .remove-helper": "removeHelper",
            "click .close-struktogram": "closeDocument",
            "click .add-command": "addCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand",

            "click .add-variable": "addVariable",
            "click .add-parameter": "addVariable",
            "click .remove-variable": "removeVariable",
            "click .remove-parameter": "removeVariable"
        },

        highlights: [],
        initialize: function() {
            var self = this;
            this.listenTo(this.model, "debugstop", function() {
                self.$el.children(".command-line").addClass("highlight-evaluating");
                self.highlightLines();
            });
            this.listenTo(this.model, "errorstop", function() {
                self.$el.children(".command-line").addClass("highlight-error");
                self.highlightLines();
            });
            this.main_sequence = new EditorSequenceView({'model': this.model.get("sequence")});
            this.listenTo(this.main_sequence, "highlight", function(e) {
                self.highlightLines();
            });
        },

        highlight_timeout: null,
        highlightLines: function() {
            var self = this;
            window.clearTimeout(this.highlight_timeout);
            this.highlight_timeout = window.setTimeout(function() {
                self.$el.find(".command-line.evaluating").removeClass("evaluating");
                self.$el.find(".command-line.error").removeClass("error");
                self.$el.find(".command-line.highlight-evaluating").addClass("evaluating").removeClass("highlight-evaluating");
                self.$el.find(".command-line.highlight-error").addClass("error").removeClass("highlight-error");
            }, 10);
        },

        onClose: function() {
            this.main_sequence.close();
        },

        editCommand: function(e) {
            $(".editing").removeClass("editing");
            this.$el.addClass("editing");
            this.$el.find("#" + this.model.cid + "_name").focus();
            return false;
        },

        saveCommand: function(e) {
            var name = this.$el.find("#" + this.model.cid + "_name").val().replace(/^\s+|\s+$/g, '');
            this.model.updateStruktogram({
                "name": name || this.model.getName(),
                "parameters": this.$el.find(".parameters .form-group").map(function() {
                    var name = $(this).find("input[name=parameter_name]").val().replace(/^\s+|\s+$/g, ''),
                        type = $(this).find("input[name=parameter_type]").val().replace(/^\s+|\s+$/g, '');
                    if (name !== "" && type !== "")
                        return {
                            'name': name,
                            'type': type
                        };
                    return null;
                }).get().filter(function(item) {
                    return item !== null;
                }),
                "variables": this.$el.find(".variables .form-group").map(function() {
                    var name = $(this).find("input[name=variable_name]").val().replace(/^\s+|\s+$/g, ''),
                        type = $(this).find("input[name=variable_type]").val().replace(/^\s+|\s+$/g, '');
                    if (name !== "" && type !== "")
                        return {
                            'name': name,
                            'type': type
                        };
                    return null;
                }).get().filter(function(item) {
                    return item !== null;
                })
            });
            return false;
        },

        addCommand: function(e) {
            $(".command-dropdown").data("model", this.model).appendTo(this.$el.children(".command-line")).show();
            return false;
        },

        removeHelper: function(e) {
            if (window.confirm(Localization.gettext("Are you sure, you want to delete this struktogram?", true))) {
                this.model.get("document").removeHelper(this.model);
            }
            return false;
        },

        closeDocument: function() {
            if (window.confirm(Localization.gettext("Are you sure, you want to close this document?", true))) {
                var doc = this.model.get("document");
                doc.get("ui").closeDocument(doc);
            }
            return false;
        },

        addVariable: function(e) {
            if ($(e.target).is(".add-variable")) {
                this.$el.find(".variables").append($(
                    this.vartemp({'variable': null, 'edit': "variable"})
                ));
            }
            if ($(e.target).is(".add-parameter")) {
                this.$el.find(".parameters").append($(
                    this.vartemp({'variable': null, 'edit': "parameter"})
                ));
            }
        },

        removeVariable: function(e) {
            $(e.target).closest(".form-group").remove();
        },

        render: function() {
            var self = this;
            this.$el.html(this.template({
                "L": Localization,
                "model": this.model,
                "vartemp": this.vartemp
            }));
            this.$el.append(this.main_sequence.$el);
            this.main_sequence.render(0);

            this.$el.find(".sortable-sequence").sortable({
                connectWith: ".sortable-sequence",
                placeholder: "sort-placeholder",
                over: function(event, ui) {
                    $(".sortable-sequence").removeClass("drag-over");
                    $(event.target).addClass("drag-over");
                    var sequence_depth = $(event.target).data("depth");
                    $(ui.placeholder).css({
                        "margin-left": 33 + (sequence_depth * 14),
                        "height": ui.helper.height()
                    });
                },
                start: function() {
                    self.$el.addClass("sorting");
                },
                stop: function() {
                    self.$el.removeClass("sorting");
                    $(".sortable-sequence").removeClass("drag-over");
                },
                handle: ".command-line",
                update: function(event, ui) {
                    var new_index = $(event.target).children("li").index(ui.item);
                    if (ui.sender || new_index !== -1) {
                        var cmd = ui.item.data("view").model,
                            target_sequence = $(event.target).data("view").model;
                            source_sequence = ui.sender !== null ? ui.sender.data("view").model : target_sequence;
                        source_sequence.removeCommand(cmd);
                        target_sequence.addCommand(cmd._type, cmd, false, new_index);
                    }
                }
            }); //.disableSelection();

            this.$el.data('view', this);
            this.$el.removeClass("editing");
            if (this.model._new) {
                this.editCommand(this.cid);
                this.model._new = false;
            }
            return this;
        }
    });
    return EditorStruktogramView;
});
