define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'views/browser/sequence',
    'text!../../templates/browser/loop.html'
], function(require, $, _, Backbone, SequenceBrowserView, loopTemplate) {
    var LoopCanvasView = Backbone.View.extend({
        tagName: "li",
        className: "loop",
        loop_sequence: null,
        template: _.template(loopTemplate),

        initialize: function() {
            var SequenceBrowserView = require('views/browser/sequence');
            this.loop_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
        },
        onClose: function() {
            this.loop_sequence.close();
        },

        render: function(ctx, design, line, x, y, fix_width, lines) {
            this.$el.html(this.template({
                "model": this.model
            }));
            this.$el.append(this.loop_sequence.$el);
            this.loop_sequence.render();
            this.$el.data("view", this);
            return this;
        }
    });
    return LoopCanvasView;
});
