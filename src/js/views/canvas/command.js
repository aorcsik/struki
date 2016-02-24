define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var CommandCanvasView = Backbone.View.extend({
        lines: [],
        size: null,
        position: null,
        initialize: function() {
            this.position = {
                "x": 0,
                "y": 0
            };
            this.size = {
                'width': 0,
                'height': 0
            };
        },
        onClose: function() {},

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    this.trigger(event.type, this);
                    console.log(event.type, this);
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

        render: function(ctx, design, line, x, y, fix_width, lines) {

            ctx.font = design.font_size + "px " + design.font_family;
            var text = this.model.get("code");
            var text_lines = text.split("\n").map(function(line) {
                return line.replace(/^\s+|\s+$/, "");
            }).filter(function(line) {
                return line !== "";
            });
            var m, height;

            this.lines = {};
            this.position.x = x;
            this.position.y = y;
            this.size.width = 0;
            this.size.height = 0;

            height = design.margin.top;
            for (var i = 0; i < text_lines.length; i++) {
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
            this.lines[line] = this.size.height;

            if (fix_width) {
                ctx.strokeRect(
                    x,
                    y,
                    this.size.width,
                    this.size.height);
            }
            return this;
        }
    });
    return CommandCanvasView;
});
