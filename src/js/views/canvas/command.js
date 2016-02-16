define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var CommandCanvasView = Backbone.View.extend({
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

        getSize: function(ctx, design) {
            return this.size;
        },

        render: function(ctx, design, x, y, fix_width) {
            this.position.x = x;
            this.position.y = y;
            ctx.font = design.font_size + "px " + design.font_family;
            var m = ctx.measureText(this.model.get("code"));
            this.size = {
                'width': fix_width || m.width + design.margin.right + design.margin.left,
                'height': design.font_size + design.margin.top + design.margin.bottom
            };
            if (fix_width) ctx.strokeRect(
                x,
                y,
                this.size.width,
                this.size.height);
            if (fix_width) ctx.fillText(
                this.model.get("code"),
                x + design.margin.left,
                y + design.font_size - 3 + design.margin.top);
            return this;
        }
    });
    return CommandCanvasView;
});
