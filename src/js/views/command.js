define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var CommandView = Backbone.View.extend({
        size: null,
        initialize: function() {
            this.size = {
                'width': 0,
                'height': 0
            };
        },
        onClose: function() {},

        getSize: function(ctx, design) {
            return this.size;
        },

        render: function(ctx, design, x, y, fix_width) {
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
    return CommandView;
});
