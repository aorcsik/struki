define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/sequence',
    'text!../../templates/browser/struktogram.html'
], function($, _, Backbone, SequenceBrowserView, struktogramTemplate){
    var StruktogramBrowserView = Backbone.View.extend({
        className: "struktogram",
        main_sequence: null,
        template: _.template(struktogramTemplate),
        events: {
            "click .remove-command": "removeCommand"
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
        },

        onClose: function() {
            this.main_sequence.close();
        },

        removeCommand: function(e) {
            var $cmd = $(e.target).closest(".remove-command").closest("li"),
                cmd = $cmd.data('view').model;
            if ($cmd.is(".branch")) {
                var $branching = $cmd.closest(".branching"),
                    branching = $branching.data('view').model;
                if (branching.get("branches").length > 1) {
                    branching.removeBranch(cmd);
                    return;
                } else {
                    $cmd = $branching;
                    cmd = branching;
                }
            }
            var $sequence = $cmd.closest(".sequence"),
                sequence = $sequence.data('view').model;
            sequence.removeCommand(cmd);
        },

        render: function() {
            var self = this;
            this.$el.html(this.template({
                "model": this.model
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
                receive: function(event, ui) {
                    var cmd = ui.item.data("view").model,
                        target_sequence = $(event.target).data("view").model,
                        source_sequence = ui.sender.data("view").model,
                        new_index = $(event.target).children("li").index(ui.item);
                    source_sequence.removeCommand(cmd);
                    target_sequence.addCommand(cmd, new_index);
                }
            }).disableSelection();
            return this;
        }
    });
    return StruktogramBrowserView;
});
