define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/browser/loop.html'
], function(require, $, _, Backbone, loopTemplate) {
    var LoopCanvasView = Backbone.View.extend({
        tagName: "li",
        className: "loop",
        loop_sequence: null,
        template: _.template(loopTemplate),
        depth: 0,

        initialize: function() {
            var self = this;
            var SequenceBrowserView = require('views/browser/sequence');
            this.loop_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
            this.listenTo(this.model, "debugstop", function() {
                $(".evaluating").removeClass("evaluating");
                self.$el.children(".command-line").addClass("evaluating");
            });
        },
        onClose: function() {
            this.loop_sequence.close();
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function(edit, only_command_line) {
            if (only_command_line) {
                this.$el.children("form").remove();
                this.$el.children(".command-line").replaceWith(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "model": this.model
                }));
            } else {
                this.$el.html(this.template({
                    "edit": edit,
                    "depth": this.depth,
                    "model": this.model
                }));
                this.$el.append(this.loop_sequence.$el);
                this.loop_sequence.setDepth(this.depth).render();
                this.$el.data("view", this);
            }
            return this;
        }
    });
    return LoopCanvasView;
});
