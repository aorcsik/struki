define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/sequence'
], function(require, $, _, Backbone, SequenceCanvasView){
    var LoopCanvasView = Backbone.View.extend({
        lines: 1,
        size: null,
        position: null,
        loop_sequence: null,
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
            this.loop_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
        },
        onClose: function() {},

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    if (!this.loop_sequence.onEvent(event)) {
                        this.trigger(event.type, this);
                        console.log(event.type, this);
                    }
                    return true;
                }
            }
            return false;
        },

        getSize: function() {
            return this.size;
        },

        getLines: function() {
            return this.lines;
        },

        getSequence: function() {
            return this.loop_sequence;
        },

        render: function(ctx, design, x, y, fix_width) {
            this.lines = 1;
            this.position.x = x;
            this.position.y = y;
            ctx.font = design.font_size + "px " + design.font_family;
            var m = ctx.measureText(this.model.get("code"));

            this.size.height = 0;
            this.size.width = 0;
            if (!this.model.get("test_after")) {
                if (fix_width) ctx.fillText(
                    this.model.get("condition").get("code"),
                    x + Math.floor((fix_width - m.width) / 2),
                    y + this.size.height + design.font_size - 3 + design.margin.top);
                this.size.height += design.font_size + design.margin.top + design.margin.bottom;
                this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);
            }
            if (this.loop_sequence.commands.length === 0) {
                if (fix_width) ctx.strokeRect(
                    20 + x,
                    y + this.size.height,
                    this.size.width - 20,
                    design.font_size + design.margin.top + design.margin.bottom);
                this.size.height += design.font_size + design.margin.top + design.margin.bottom;
                this.lines += 1;
            } else {
                this.loop_sequence.render(ctx, design, x + 20, y + this.size.height, fix_width - 20);
                this.size.height += this.loop_sequence.getSize().height;
                this.size.width = fix_width || Math.max(this.size.width, 20 + this.loop_sequence.getSize().width);
                this.lines += this.loop_sequence.getLines();
            }
            if (this.model.get("test_after")) {
                if (fix_width) ctx.fillText(
                    this.model.get("code"),
                    x + Math.floor((fix_width - m.width) / 2),
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
    return LoopCanvasView;
});
