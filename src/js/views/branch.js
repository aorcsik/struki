define([
    'jquery',
    'underscore',
    'backbone',
    'views/sequence'
], function($, _, Backbone, SequenceView){
    var BranchView = Backbone.View.extend({
        size: null,
        branch_sequence: null,
        initialize: function() {
            this.size = {
                'width': 0,
                'height': 0
            };
            this.branch_sequence = new SequenceView();
        },
        onClose: function() {},

        getSize: function(ctx, design) {
            return this.size;
        },

        getSequence: function() {
            return this.branch_sequence;
        },

        render: function(ctx, design, x, y, fix_width, else_text) {
            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model ? this.model.get("code") : else_text;
            var m = ctx.measureText(text);

            this.size.height = 0;
            this.size.width = 0;
            if (fix_width) {
                if (!text || text == "else") {
                    ctx.fillText(
                        text,
                        x + design.margin.left,
                        y + this.size.height + design.font_size - 3 + design.margin.top);                ctx.beginPath();
                    ctx.beginPath();
                    ctx.moveTo(x + fix_width, y + this.size.height);
                    ctx.lineTo(x + fix_width - 10, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    if (text == "else") {
                        ctx.beginPath();
                        ctx.moveTo(x, y + this.size.height);
                        ctx.lineTo(x, y + design.font_size + design.margin.top + design.margin.bottom);
                        ctx.stroke();
                    }
                } else {
                    ctx.fillText(
                        text,
                        x + 10 + design.margin.left,
                        y + this.size.height + design.font_size - 3 + design.margin.top);                ctx.beginPath();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x + 10, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                }
            }
            this.size.height += design.font_size + design.margin.top + design.margin.bottom;
            this.size.width = fix_width || Math.max(this.size.width, 10 + m.width + design.margin.right + design.margin.left);

            if (this.branch_sequence.commands.length === 0) {
                if (fix_width) ctx.strokeRect(
                    x,
                    y + this.size.height,
                    this.size.width,
                    10);
                this.size.height += 10;
            } else {
                this.branch_sequence.render(ctx, design, x, y + this.size.height, fix_width);
                this.size.height += this.branch_sequence.getSize().height;
                this.size.width = fix_width || Math.max(this.size.width, 20 + this.branch_sequence.getSize().width);
            }

            /* if (fix_width) ctx.strokeRect(
                x,
                y,
                fix_width || this.size.width,
                this.size.height); */
            return this;
        }
    });
    return BranchView;
});
