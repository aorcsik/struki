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
            var SequenceBrowserView = require('views/browser/sequence');
            this.loop_sequence = new SequenceBrowserView({'model': this.model.get("sequence")});
        },
        onClose: function() {
            this.loop_sequence.close();
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function(edit) {
            this.$el.html(this.template({
                "edit": edit,
                "depth": this.depth,
                "model": this.model
            }));
            this.$el.append(this.loop_sequence.$el);
            this.loop_sequence.setDepth(this.depth).render();
            this.$el.data("view", this);
            return this;
        }
    });
    return LoopCanvasView;
});