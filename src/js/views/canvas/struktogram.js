define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/sequence'
], function($, _, Backbone, SequenceCanvasView){
    var StruktogramCanvasView = Backbone.View.extend({
        lines: null,
        size: null,
        position: null,
        main_sequence: null,

        initialize: function() {
            var self = this;
            this.size = {
                "width": 0,
                "height": 0
            };
            this.position = {
                "x": 0,
                "y": 0
            };
            this.main_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
        },

        onClose: function() {},

        getSize: function() {
            return this.size;
        },

        getLines: function() {
            return this.lines;
        },

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    if (!this.main_sequence.onEvent(event)) {
                        this.trigger(event.type, this);
                        console.log(event.type, this);
                        return true;
                    }
                }
            }
            return false;
        },

        roundRectPath: function(ctx, x, y, width, height, radius) {
            if (typeof radius === 'number') {
                radius = {tl: radius, tr: radius, br: radius, bl: radius};
            } else {
                redius = $.extend({tl: 0, tr: 0, br: 0, bl: 0}, radius);
            }
            ctx.beginPath();
            ctx.moveTo(x + radius.tl, y);
            ctx.lineTo(x + width - radius.tr, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
            ctx.lineTo(x + width, y + height - radius.br);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
            ctx.lineTo(x + radius.bl, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
            ctx.lineTo(x, y + radius.tl);
            ctx.quadraticCurveTo(x, y, x + radius.tl, y);
            ctx.closePath();
        },

        strokeRoundRect: function(ctx, x, y, width, height, radius) {
            this.roundRectPath(ctx, x, y, width, height, radius);
            ctx.stroke();
        },

        render: function(ctx, design, line, x, y, fix_width) {
            this.lines = {};
            this.position.x = x;
            this.position.y = y;

            this.main_sequence.render(ctx, design, line, x, y);
            this.size.width = this.main_sequence.getSize().width;
            this.size.height = this.main_sequence.getSize().height;
            this.lines = this.main_sequence.getLines();

            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.get("name");
            var m = ctx.measureText(text);

            var label_width = m.width + design.margin.right + design.margin.left;
            var label_height = design.font_size + design.margin.top + design.margin.bottom;
            this.size.width = Math.max(this.size.width, label_width);
            this.size.height += label_height + 10;

            if (fix_width) {

                this.strokeRoundRect(ctx,
                    x + Math.floor((this.size.width - label_width) / 2),
                    y,
                    label_width,
                    label_height,
                    Math.ceil(label_height / 2));
                ctx.font = design.font_size + "px " + design.font_family;
                ctx.fillText(
                    text,
                    this.position.x + Math.floor((this.size.width - label_width) / 2) + design.margin.left,
                    this.position.y + design.font_size - 3 + design.margin.top);
                ctx.beginPath();
                ctx.moveTo(x + Math.floor((this.size.width - label_width) / 2 + label_width/2), y + label_height);
                ctx.lineTo(x + Math.floor((this.size.width - label_width) / 2 + label_width/2), y + label_height + 10);
                ctx.stroke();
                y += label_height + 10;

                this.main_sequence.render(ctx, design, line,
                    x + Math.max(0, Math.floor((label_width - this.main_sequence.getSize().width) / 2)),
                    y, this.main_sequence.getSize().width, this.lines);
            }

            return this;
        }
    });
    return StruktogramCanvasView;
});
