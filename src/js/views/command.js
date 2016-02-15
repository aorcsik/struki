define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var CommandView = Backbone.View.extend({
        initialize: function() {},
        onClose: function() {},

        size: {
            'width': 0,
            'height': 0
        },

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
                x + 0.5,
                y + 0.5,
                this.size.width,
                this.size.height);
            if (fix_width) ctx.fillText(
                this.model.get("code"),
                x + 0.5 + design.margin.left,
                y + 0.5 + design.font_size - 3 + design.margin.top);
            return this;
        }
    });
    return CommandView;
});
