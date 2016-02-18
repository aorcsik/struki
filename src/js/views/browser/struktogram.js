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

        initialize: function() {
            var self = this;
            this.main_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
            this.listenTo(this.model, "change", function(e) {
                window.setTimeout(function() {
                    self.render();
                }, 10);
            });
        },

        onClose: function() {
            this.main_sequence.close();
        },

        render: function() {
            this.$el.html(this.template({
                "model": this.model
            }));
            this.$el.append(this.main_sequence.$el);
            this.main_sequence.render();

            $(".sortable-equence").sortable({
                connectWith: ".sortable-equence",
                placeholder: "sort-placeholder",
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
