define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/sequence'
], function($, _, Backbone, SequenceCanvasView){
    var StruktogramCanvasView = Backbone.View.extend({
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
        main_sequence: null,
        size: null,
        position: null,
        events: {
            "click": "onClickHandler"
        },

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
            this.main_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
            this.listenTo(this.model, 'change', function(e) {
                self.render();
            });
        },

        onClose: function() {},

        onClickHandler: function(e) {
            this.onEvent({
                'type': "click",
                'x': e.pageX - this.$el.offset().left,
                'y': e.pageY - this.$el.offset().top
            });
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

        render: function() {
            var ctx = this.el.getContext('2d');
            ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.main_sequence.render(ctx, this.design, 0, 0);
            this.size.width = this.main_sequence.getSize().width;
            this.size.height = this.main_sequence.getSize().height;

            this.position.x = 4.5;
            this.position.y = 4.5;

            ctx.font = this.design.font_size + "px " + this.design.font_family;
            var text = this.model.get("name");
            var m = ctx.measureText(text);

            var label_width = m.width + this.design.margin.right + this.design.margin.left;
            var label_height = this.design.font_size + this.design.margin.top + this.design.margin.bottom;
            this.size.width = Math.max(this.size.width, label_width);
            this.size.height += label_height + 10;

            this.$el.attr({
                "width": this.size.width + 9,
                "height": this.size.height + 9
            });

            var x = this.position.x;
            var y = this.position.y;
            this.strokeRoundRect(ctx,
                x + Math.floor((this.size.width - label_width) / 2),
                y,
                label_width,
                label_height,
                Math.ceil(label_height / 2));
            ctx.font = this.design.font_size + "px " + this.design.font_family;
            ctx.fillText(
                text,
                this.position.x + Math.floor((this.size.width - label_width) / 2) + this.design.margin.left,
                this.position.y + this.design.font_size - 3 + this.design.margin.top);
            ctx.beginPath();
            ctx.moveTo(x + Math.floor((this.size.width - label_width) / 2 + label_width/2), y + label_height);
            ctx.lineTo(x + Math.floor((this.size.width - label_width) / 2 + label_width/2), y + label_height + 10);
            ctx.stroke();
            y += label_height + 10;

            this.main_sequence.render(ctx, this.design,
                x + Math.max(0, Math.floor((label_width - this.main_sequence.getSize().width) / 2)),
                y, this.main_sequence.getSize().width);

            // $("body").append(this.getDownloadLink());

            return this;
        }
    });
    return StruktogramCanvasView;
});
