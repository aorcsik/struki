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
            this.listenTo(this.model, "debugstop", function() {
                self.trigger("redraw", {'highlight': self});
                self.highlight = "active_background";
            });
            this.listenTo(this.model, "errorstop", function() {
                self.trigger("redraw", {'highlight': self});
                self.highlight = "error_background";
            });
            this.main_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
            this.listenTo(this.main_sequence, "redraw", function(e) {
                // console.log("redraw -> redraw", e);
                self.trigger("redraw", e);
            });
        },

        onClose: function() {
            this.main_sequence.close();
        },

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

        fillRoundRect: function(ctx, x, y, width, height, radius) {
            this.roundRectPath(ctx, x, y, width, height, radius);
            ctx.fill();
        },

        render: function(ctx, design, line, x, y, fix_width) {
            this.lines = {};
            this.position.x = x;
            this.position.y = y;

            this.main_sequence.render(ctx, design, line, x, y);
            this.size.width = this.main_sequence.getSize().width;
            this.size.height = this.main_sequence.getSize().height;
            this.lines = this.main_sequence.getLines();

            var vars_width = 0;
            var vars_height = 0;
            this.model.get("variables").forEach(function(variable) {
                var variable_text = variable.toString();
                var variable_m = ctx.measureText(variable_text);
                vars_width = Math.max(vars_width, design.margin.left + variable_m.width + design.margin.right);
            });
            vars_height = this.model.get("variables").length * design.font_size + (this.model.get("variables").length - 1) * design.line_distance + design.margin.top + design.margin.bottom;
            this.size.width += vars_width;
            this.size.height = Math.max(this.size.height, vars_height);

            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.getName() + "(" + this.model.get("parameters").map(function(parameter) {
                return parameter.toString();
            }) + ")";
            var m = ctx.measureText(text);

            var label_width = m.width + design.margin.right + design.margin.left;
            var label_height = design.font_size + design.margin.top + design.margin.bottom;
            this.size.width = Math.max(this.size.width, label_width);
            this.size.height += label_height + design.label_distance;

            var label_x = x + Math.max(0, Math.floor((this.size.width - vars_width - label_width) / 2));
            var sequence_x = label_x + Math.floor(label_width / 2) - (this.main_sequence.getSize().width / 2);
            this.size.width += sequence_x;

            if (fix_width) {

                if (this.highlight) {
                    ctx.fillStyle = design[this.highlight];
                    this.fillRoundRect(ctx,
                        label_x,
                        y,
                        label_width,
                        label_height,
                        Math.ceil(label_height / 2));
                    ctx.fillStyle = design.active_color;
                }

                // LABEL
                this.strokeRoundRect(ctx,
                    label_x,
                    y,
                    label_width,
                    label_height,
                    Math.ceil(label_height / 2));
                ctx.font = design.font_size + "px " + design.font_family;
                ctx.fillText(
                    text,
                    label_x + design.margin.left,
                    y + design.font_size - 3 + design.margin.top);
                ctx.beginPath();
                ctx.moveTo(label_x + Math.floor(label_width / 2), y + label_height);
                ctx.lineTo(label_x + Math.floor(label_width / 2), y + label_height + 10);
                ctx.stroke();
                y += label_height + design.label_distance;

                if (this.highlight) {
                    ctx.fillStyle = design.default_color;
                    this.highlight = false;
                }

                // MAIN SEQUENCE
                this.main_sequence.render(ctx, design, line,
                    sequence_x,
                    y, this.main_sequence.getSize().width, this.lines);
                ctx.strokeRect(
                    sequence_x - 1,
                    y - 1 ,
                    this.main_sequence.getSize().width + 2,
                    this.main_sequence.getSize().height + 2);

                // VARIABLES
                ctx.font = design.font_size + "px " + design.font_family;
                var variables_x = sequence_x + this.main_sequence.getSize().width;
                var variables_y = y + design.margin.top;
                this.model.get("variables").forEach(function(variable, idx) {
                    var variable_text = variable.toString();
                    variables_y += design.font_size + (idx > 0 ? design.line_distance : 0);
                    ctx.fillText(
                        variable_text,
                        variables_x + design.margin.left,
                        variables_y - 3);
                });
                if (!ctx.setLineDash) {
                    ctx.setLineDash = function() {};
                }
                ctx.setLineDash([5]);
                ctx.strokeRect(
                    variables_x,
                    y,
                    vars_width,
                    vars_height);
                ctx.setLineDash([0]);
            }

            return this;
        }
    });
    return StruktogramCanvasView;
});
