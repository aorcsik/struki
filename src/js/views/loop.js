define([
    'jquery',
    'underscore',
    'backbone',
    'views/sequence'
], function($, _, Backbone, SequenceView){
    var LoopView = Backbone.View.extend({
        size: null,
        loop_sequence: null,
        initialize: function() {
            this.size = {
                'width': 0,
                'height': 0
            };
            this.loop_sequence = new SequenceView();
        },
        onClose: function() {},

        getSize: function(ctx, design) {
            return this.size;
        },

        getSequence: function() {
            return this.loop_sequence;
        },

        render: function(ctx, design, x, y, fix_width) {
            ctx.font = design.font_size + "px " + design.font_family;
            var m = ctx.measureText(this.model.get("code"));

            this.size.height = 0;
            this.size.width = 0;
            if (!this.model.get("test_after")) {
                if (fix_width) ctx.fillText(
                    this.model.get("code"),
                    x + design.margin.left,
                    y + this.size.height + design.font_size - 3 + design.margin.top);
                this.size.height += design.font_size + design.margin.top + design.margin.bottom;
                this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);
            }
            if (this.loop_sequence.commands.length === 0) {
                if (fix_width) ctx.strokeRect(
                    20 + x,
                    y + this.size.height,
                    this.size.width - 20,
                    10);
                this.size.height += 10;
            } else {
                this.loop_sequence.render(ctx, design, x + 20, y + this.size.height, fix_width - 20);
                this.size.height += this.loop_sequence.getSize().height;
                this.size.width = fix_width || Math.max(this.size.width, 20 + this.loop_sequence.getSize().width);
            }
            if (this.model.get("test_after")) {
                if (fix_width) ctx.fillText(
                    this.model.get("code"),
                    x + design.margin.left,
                    y + this.size.height + design.font_size - 3 + design.margin.top);
                this.size.height += design.font_size + design.margin.top + design.margin.bottom;
                this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);
            }

            if (fix_width) ctx.strokeRect(
                x,
                y,
                fix_width || this.size.width,
                this.size.height);
            return this;
        }
    });
    return LoopView;
});
