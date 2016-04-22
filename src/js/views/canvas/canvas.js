define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/struktogram'
], function($, _, Backbone, StruktogramCanvasView){
    var CanvasView = Backbone.View.extend({
        tagName: "canvas",
        attributes: {
            "width": 800,
            "height": 600
        },
        design: {
            "font_family": "Ubuntu Mono",
            "font_size": 14,
            "line_distance": 3,
            "margin": {
                "top": 7,
                "right": 10,
                "bottom": 7,
                "left": 10
            },
            "label_distance": 10,
            "loop_inset": 20,
            "default_color": "#000000",
            "active_color": "#ffffff",
            "active_background": "rgb(0,150,136)",
            "error_background": "rgb(200,0,0)"
        },
        events: {
            "click": "onClickHandler"
        },

        initialize: function() {
            var self = this,
                render_delay;
            this.struktogram = new StruktogramCanvasView({'model': this.model});
            this.listenTo(this.model, 'change', this.throttleRender);
            this.listenTo(this.model, 'return', this.throttleRender);
            this.listenTo(this.struktogram, 'redraw', this.throttleRender);
        },

        onClose: function() {
            this.struktogram.close();
        },

        onClickHandler: function(e) {
            this.struktogram.onEvent({
                'type': "click",
                'x': e.pageX - this.$el.offset().left,
                'y': e.pageY - this.$el.offset().top
            });
        },

        render_delay: null,
        throttleRender: function(e) {
            var self = this;
            window.clearTimeout(this.render_delay);
            this.render_delay = window.setTimeout(function() {
                self.render();
            }, 10);
        },

        render: function() {

            var ctx = this.el.getContext('2d');
            ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.struktogram.render(ctx, this.design, 0, 0, 0);

            this.$el.attr({
                "width": this.struktogram.getSize().width + 9,
                "height": this.struktogram.getSize().height + 9
            });

            this.struktogram.render(ctx, this.design, 0, 4.5, 4.5, this.struktogram.getSize().width);
            this.$el.data("name", this.model.get("name"));
        }
    });
    return CanvasView;
});
