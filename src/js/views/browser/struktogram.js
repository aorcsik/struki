define([
    'jquery',
    'underscore',
    'backbone',
    'models/variable',
    'models/command',
    'models/branch',
    'models/conditional',
    'models/loop',
    'views/browser/sequence',
    'text!../../../templates/browser/variable.html',
    'text!../../../templates/browser/struktogram.html',
    'text!../../../templates/browser/add_dropdown.html',
], function($, _, Backbone, Variable, Command, Branch, Conditional, Loop, SequenceBrowserView, variableTemplate, struktogramTemplate, addDropdownTemplate){
    var StruktogramBrowserView = Backbone.View.extend({
        className: "struktogram",
        main_sequence: null,
        template: _.template(struktogramTemplate),
        vartemp: _.template(variableTemplate),
        adddroptemp: _.template(addDropdownTemplate),
        events: {
            "click .remove-command": "removeCommand",
            "click .add-command": "addCommand",
            "click .edit-command": "editCommand",
            "click .save-command": "saveCommand",
            "click .add-variable": "addVariable",
            "click .add-parameter": "addVariable",
            "click .remove-variable": "removeVariable",
            "click .remove-parameter": "removeVariable"
        },

        initialize: function() {
            var self = this;
            this.main_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
            this.listenTo(this.model, "change", function(e) {
                // TODO: better handling of callback timing
                window.setTimeout(function() {
                    self.render();
                }, 10);
            });
            /* $(window).on("click.closedropdown", function(e) {
                if (!$(e.target).is(".add-command")) {
                    $(".command-dropdown").remove();
                }
            }); */
        },

        onClose: function() {
            this.main_sequence.close();
            $(window).off("click.closedropdown");
        },

        removeCommand: function(e) {
            var $cmd = $(e.target).closest(".remove-command").closest("li"),
                cmd = $cmd.data('view').model;
            if ($cmd.is(".branch")) {
                var $conditional = $cmd.closest(".conditional"),
                    conditional = $conditional.data('view').model;
                if (conditional.get("branches").length > 1) {
                    conditional.removeBranch(cmd);
                    return;
                } else {
                    $cmd = $conditional;
                    cmd = conditional;
                }
            }
            var $sequence = $cmd.closest(".sequence"),
                sequence = $sequence.data('view').model;
            sequence.removeCommand(cmd);
        },

        editCommand: function(e) {
            $(".editing").each(function() {
                $(this).closest("li, .struktogram").data("view").render(false, true);
            });
            var $cmd = $(e.target).closest(".edit-command").closest("li, .struktogram"),
                cmd = $cmd.data('view').model;
            $cmd.data('view').render(true, true);
        },

        saveCommand: function(e) {
            var $cmd = $(e.target).closest(".save-command").closest("li, .struktogram"),
                cmd = $cmd.data('view').model;

            if (cmd.type === "command") {
                cmd.set({
                    "code": $cmd.find("#" + cmd.cid + "_code").val(),
                    "_counter": cmd.get("_counter") ? cmd.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
            else if (cmd.type === "loop") {
                cmd.set({
                    "condition": $cmd.find("#" + cmd.cid + "_condition").val(),
                    "test_after": $cmd.find("#" + cmd.cid + "_type").val() == 1,
                    "range": $cmd.find("#" + cmd.cid + "_type").val() == 2,
                    "_counter": cmd.get("_counter") ? cmd.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
            else if (cmd.type === "branch") {
                cmd.set({
                    "condition": $cmd.find("#" + cmd.cid + "_condition").val(),
                    "_counter": cmd.get("_counter") ? cmd.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
            else if (cmd.type === "struktogram") {
                var name = $cmd.find("#" + cmd.cid + "_name").val().replace(/^\s+|\s+$/g, '');
                cmd.set({
                    "name": name || cmd.get("name"),
                    "parameters": this.$el.find(".parameters .form-group").map(function() {
                        var name = $(this).find("input[name=parameter_name]").val().replace(/^\s+|\s+$/g, ''),
                            type = $(this).find("input[name=parameter_type]").val().replace(/^\s+|\s+$/g, '');
                        if (name !== "" && type !== "")
                            return new Variable({
                                'name': name,
                                'type': type
                            });
                        return null;
                    }).get().filter(function(item) {
                        return item !== null;
                    }),
                    "variables": this.$el.find(".variables .form-group").map(function() {
                        var name = $(this).find("input[name=variable_name]").val().replace(/^\s+|\s+$/g, ''),
                            type = $(this).find("input[name=variable_type]").val().replace(/^\s+|\s+$/g, '');
                        if (name !== "" && type !== "")
                            return new Variable({
                                'name': name,
                                'type': type
                            });
                        return null;
                    }).get().filter(function(item) {
                        return item !== null;
                    }),
                    "_counter": cmd.get("_counter") ? cmd.get("_counter") + 1 : 1,
                    "_updated_at": (new Date()).getTime()
                });
            }
            else {
                $cmd.data('view').render();
            }
        },

        addCommand: function(e) {
            $(".command-dropdown").remove();

            var $cmd = $(e.target).closest(".add-command").closest("li, .struktogram"),
                cmd = $cmd.data('view').model;

            if (cmd.type === "loop") {
                $cmd.children(".command-line").append(this.adddroptemp({
                    "options": {'command': true, 'loop': true, 'conditional': true, 'branch': false}
                }));
            }
            else if (cmd.type === "branch") {
                $cmd.children(".command-line").append(this.adddroptemp({
                    "options": {'command': true, 'loop': true, 'conditional': true, 'branch': true}
                }));
            }
            else if (cmd.type === "struktogram") {
                $cmd.children(".command-line").append(this.adddroptemp({
                    "options": {'command': true, 'loop': true, 'conditional': true, 'branch': false}
                }));
            }

            var popup_delay = null;
            $(".command-dropdown").on("mouseover", function() {
                window.clearTimeout(popup_delay);
            }).on("mouseout", function() {
                popup_delay = window.setTimeout(function() {
                    $(".command-dropdown").remove();
                }, 100);
            });
            $(".command-dropdown li").on("click", function() {
                var type = $(this).data("type");
                if (type === "command") {
                    cmd.get("sequence").addCommand(new Command());
                }
                else if (type === "loop") {
                    cmd.get("sequence").addCommand(new Loop());
                }
                else if (type === "conditional") {
                    cmd.get("sequence").addCommand(new Conditional());
                }
                else if (type === "branch") {
                    var $conditional = $cmd.closest(".conditional"),
                        conditional = $conditional.data('view').model;
                    conditional.addBranch(new Branch());
                }
            });
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

        render: function(edit, only_command_line) {
            var self = this;
            if (only_command_line) {
                this.$el.children("form").remove();
                this.$el.children(".command-line").replaceWith(this.template({
                    "edit": edit,
                    "model": this.model,
                    "vartemp": this.vartemp
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "model": this.model,
                    "vartemp": this.vartemp
                }));
                this.$el.append(this.main_sequence.$el);
                this.main_sequence.render(0);

                $(".sortable-sequence").sortable({
                    connectWith: ".sortable-sequence",
                    placeholder: "sort-placeholder",
                    over: function(event, ui) {
                        $(".sortable-sequence").removeClass("drag-over");
                        $(event.target).addClass("drag-over");
                        var sequence_depth = $(event.target).data("depth");
                        $(ui.placeholder).css("margin-left", (1 + sequence_depth) * 30);
                    },
                    start: function() {
                        self.$el.addClass("sorting");
                    },
                    stop: function() {
                        self.$el.removeClass("sorting");
                        $(".sortable-sequence").removeClass("drag-over");
                    },
                    update: function(event, ui) {
                        var cmd = ui.item.data("view").model,
                            target_sequence = $(event.target).data("view").model;
                            source_sequence = ui.sender !== null ? ui.sender.data("view").model : target_sequence;
                            new_index = $(event.target).children("li").index(ui.item);
                        source_sequence.removeCommand(cmd);
                        target_sequence.addCommand(cmd, new_index);
                    }
                }).disableSelection();
                this.$el.data('view', this);
            }
            return this;
        }
    });
    return StruktogramBrowserView;
});
