define([
    'require',
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/sequence'
], function(require, $, _, Backbone, SequenceCanvasView){
    var LoopCanvasView = Backbone.View.extend({
        lines: null,
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
        onClose: function() {
            this.loop_sequence.close();
        },

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

        render: function(ctx, design, line, x, y, fix_width, lines) {
            var m, i, height;

            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.get("condition");
            var text_lines = text.split("\n").map(function(line) {
                return line.replace(/^\s+|\s+$/, "");
            }).filter(function(line) {
                return line !== "";
            });

            this.lines = {};
            this.position.x = x;
            this.position.y = y;
            this.size.height = 0;
            this.size.width = 0;
            if (this.model.get("range") || !this.model.get("test_after")) {
                height = design.margin.top;
                for (i = 0; i < text_lines.length; i++) {
                    m = ctx.measureText(text_lines[i]);
                    this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);
                    height += design.font_size + (i > 0 ? design.line_distance : 0);
                    if (fix_width) {
                        ctx.fillText(
                            text_lines[i],
                            x + Math.floor((fix_width - m.width) / 2),
                            y + this.size.height + height - 3);
                    }
                }
                height += design.margin.bottom;
                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;
            }
            if (this.loop_sequence.commands.length === 0) {
                height = design.font_size + design.margin.top + design.margin.bottom;
                if (fix_width) ctx.strokeRect(
                    20 + x,
                    y + this.size.height,
                    this.size.width - 20,
                    height);
                this.size.height += height;
                this.lines[line++] = height;
            } else {
                this.loop_sequence.render(ctx, design, line, x + 20, y + this.size.height, fix_width - 20, lines);
                this.size.height += this.loop_sequence.getSize().height;
                this.size.width = fix_width || Math.max(this.size.width, 20 + this.loop_sequence.getSize().width);
                for (var key in this.loop_sequence.getLines()) {
                    this.lines[key] = this.loop_sequence.getLines()[key];
                    line = key;
                }
                line++;
            }
            if (!this.model.get("range") && this.model.get("test_after")) {
                height = design.margin.top;
                for (i = 0; i < text_lines.length; i++) {
                    m = ctx.measureText(text_lines[i]);
                    this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);
                    height += design.font_size + (i > 0 ? design.line_distance : 0);
                    if (fix_width) {
                        ctx.fillText(
                            text_lines[i],
                            x + design.margin.left,
                            y + this.size.height + height - 3);
                    }
                }
                height += design.margin.bottom;
                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;
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
