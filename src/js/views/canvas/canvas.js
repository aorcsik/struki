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
            "margin": {
                "top": 7,
                "right": 10,
                "bottom": 7,
                "left": 10
            }
        },
        events: {
            "click": "onClickHandler"
        },

        initialize: function() {
            var self = this;
            this.struktogram = new StruktogramCanvasView({'model': this.model.get("struktogram")});
            this.listenTo(this.model, 'change', function(e) {
                self.render();
            });
        },

        onClose: function() {},

        onClickHandler: function(e) {
            this.struktogram.onEvent({
                'type': "click",
                'x': e.pageX - this.$el.offset().left,
                'y': e.pageY - this.$el.offset().top
            });
        },

        getDownloadLink: function() {
            var img = this.el.toDataURL("image/png");
            if (navigator.msSaveBlob) {
                var blob = b64toBlob(image.replace("data:image/png;base64,",""),"image/png");
                return $("<a href='javascript:;'>Download...</a>").on("click", function() {
                    navigator.msSaveBlob(blob, "structogram.png");
                });
            } else {
                return $("<a href='" + img + "' target='_blank' download='structogram.png'>Download...</a>");
            }
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

            // $("body").append(this.getDownloadLink());
        }
    });
    return CanvasView;
});
