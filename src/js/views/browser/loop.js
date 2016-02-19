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

        initialize: function() {
            var SequenceBrowserView = require('views/browser/sequence');
            this.loop_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
        },
        onClose: function() {
            this.loop_sequence.close();
        },

        render: function(depth) {
            this.$el.html(this.template({
                "depth": depth,
                "model": this.model
            }));
            this.$el.append(this.loop_sequence.$el);
            this.loop_sequence.render(depth);
            this.$el.data("view", this);
            return this;
        }
    });
    return LoopCanvasView;
});
