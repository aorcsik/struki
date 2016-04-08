define([
    'require',
    'jquery',
    'underscore',
    'backbone'
], function(require, $, _, Backbone){
    var BranchCanvasView = Backbone.View.extend({
        lines: null,
        size: null,
        position: null,
        branch_sequence: null,
        highlight: null,
        initialize: function() {
            var self = this;
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
            this.listenTo(this.branch_sequence, "redraw", function(e) {
                self.trigger("redraw", e);
            });
            this.listenTo(this.model, "debugstop", function() {
                self.trigger("redraw", {'highlight': self});
                self.highlight = "active_background";
            });
            this.listenTo(this.model, "errorstop", function() {
                self.trigger("redraw", {'highlight': self});
                self.highlight = "error_background";
            });
        },
        onClose: function() {
            this.branch_sequence.close();
        },

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

        getSize: function() {
            return this.size;
        },

        getLines: function() {
            return this.lines;
        },

        render: function(ctx, design, line, x, y, fix_width, lines, else_text, solo) {
            var m, height;

            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.get("condition") || else_text;
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

            if (fix_width && lines && lines[line] && this.highlight) {
                ctx.fillStyle = design[this.highlight];
                ctx.fillRect(x, y, fix_width, lines[line]);
                ctx.fillStyle = design.active_color;
            }

            if (!text) {

                m = ctx.measureText(text);
                height = design.margin.top + design.font_size + design.margin.bottom;
                this.size.width = fix_width || Math.max(this.size.width, m.width + design.margin.right + design.margin.left);

                if (fix_width) {
                    ctx.beginPath();
                    ctx.moveTo(x + fix_width, y + this.size.height);
                    ctx.lineTo(x + fix_width - 20, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                    ctx.font = 14 + "px " + design.font_family;
                    ctx.fillText(
                        "H",
                        x + fix_width - 10,
                        y + this.size.height + (lines && lines[line] || height) - 3);
                    ctx.font = design.font_size + "px " + design.font_family;
                }

                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;

            } else if (text == "else") {

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

                if (fix_width) {
                    ctx.beginPath();
                    ctx.moveTo(x + fix_width, y + this.size.height);
                    ctx.lineTo(x + fix_width - 10, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                }

                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;

            } else if (solo) {

                height = design.margin.top;
                for (i = 0; i < text_lines.length; i++) {
                    m = ctx.measureText(text_lines[i]);
                    this.size.width = fix_width || Math.max(this.size.width, 10 + m.width + design.margin.right + design.margin.left);
                    height += design.font_size + (i > 0 ? 3 : 0);
                    if (fix_width) {
                        ctx.fillText(
                            text_lines[i],
                            x + Math.floor((solo - m.width) / 2),
                            y + this.size.height + height - 3);
                    }
                }
                height += design.margin.bottom;

                if (fix_width) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x + 20, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                    ctx.font = 14 + "px " + design.font_family;
                    ctx.fillText(
                        "I",
                        x + 3,
                        y + this.size.height + (lines && lines[line] || height) - 3);
                    ctx.font = design.font_size + "px " + design.font_family;
                }

                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;

            } else {

                height = design.margin.top;
                for (i = 0; i < text_lines.length; i++) {
                    m = ctx.measureText(text_lines[i]);
                    this.size.width = fix_width || Math.max(this.size.width, 10 + m.width + design.margin.right + design.margin.left);
                    height += design.font_size + (i > 0 ? 3 : 0);
                    if (fix_width) {
                        ctx.fillText(
                            text_lines[i],
                            x + 10 + design.margin.left,
                            y + this.size.height + height - 3);
                    }
                }
                height += design.margin.bottom;

                if (fix_width) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x + 10, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x, y + this.size.height + (lines && lines[line] || height));
                    ctx.stroke();
                }

                this.size.height += lines && lines[line] || height;
                this.lines[line++] = height;

            }

            if (fix_width && this.highlight) {
                ctx.fillStyle = design.default_color;
                this.highlight = false;
            }

            if (this.branch_sequence.commands.length === 0) {
                height = design.font_size + design.margin.top + design.margin.bottom;
                if (fix_width) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + this.size.height);
                    ctx.lineTo(x + this.size.width, y + this.size.height);
                    ctx.stroke();
                }
                this.size.height += height;
                this.lines[line++] = height;
            } else {
                this.branch_sequence.render(ctx, design, line, x, y + this.size.height, fix_width, lines);
                this.size.height += this.branch_sequence.getSize().height;
                this.size.width = fix_width || Math.max(this.size.width, 20 + this.branch_sequence.getSize().width);
                for (var key in this.branch_sequence.getLines()) {
                    this.lines[key] = this.branch_sequence.getLines()[key];
                    line = key;
                }
                line++;
            }

            return this;
        }
    });
    return BranchCanvasView;
});
