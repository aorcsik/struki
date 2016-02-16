define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/sequence'
], function(require, $, _, Backbone, SequenceCanvasView){
    var BranchCanvasView = Backbone.View.extend({
        size: null,
        position: null,
        branch_sequence: null,
        initialize: function() {
            this.size = {
                'width': 0,
                'height': 0
            };
            this.position = {
                "x": 0,
                "y": 0
            };
            var SequenceCanvasView = require('views/canvas/sequence');
            this.branch_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
        },
        onClose: function() {},

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    if (!this.branch_sequence.onEvent(event)) {
                        this.trigger(event.type, this);
                        console.log(event.type, this);
                    }
                    return true;
                }
            }
            return false;
        },

        getSize: function(ctx, design) {
            return this.size;
        },

        getSequence: function() {
            return this.branch_sequence;
        },

        render: function(ctx, design, x, y, fix_width, else_text, solo) {
            this.position.x = x;
            this.position.y = y;
            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.get("condition").get("code") || else_text;
            var m = ctx.measureText(text);

            this.size.height = 0;
            this.size.width = 0;
            if (fix_width) {
                if (!text) {
                    ctx.beginPath();
                    ctx.moveTo(x + fix_width, y + this.size.height);
                    ctx.lineTo(x + fix_width - 20, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    ctx.font = 14 + "px " + design.font_family;
                    ctx.fillText(
                        "H",
                        x + fix_width - 10,
                        y + design.font_size + design.margin.top + design.margin.bottom - 3);
                    ctx.font = design.font_size + "px " + design.font_family;
                } else if (text == "else") {
                    ctx.fillText(
                        text,
                        x + design.margin.left,
                        y + this.size.height + design.font_size - 3 + design.margin.top);
                    ctx.beginPath();
                    ctx.moveTo(x + fix_width, y + this.size.height);
                    ctx.lineTo(x + fix_width - 10, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                } else if (solo) {
                    ctx.fillText(
                        text,
                        x + Math.floor((solo - m.width) / 2),
                        y + this.size.height + design.font_size - 3 + design.margin.top);                ctx.beginPath();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x + 20, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + design.font_size + design.margin.top + design.margin.bottom);
                    ctx.stroke();
                    ctx.font = 14 + "px " + design.font_family;
                    ctx.fillText(
                        "I",
                        x + 3,
                        y + design.font_size + design.margin.top + design.margin.bottom - 3);
                    ctx.font = design.font_size + "px " + design.font_family;
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
    return BranchCanvasView;
});
