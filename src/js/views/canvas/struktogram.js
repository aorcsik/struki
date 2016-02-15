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

        initialize: function() {
            console.log("Struktogram Canvas View initialized");
            this.main_sequence = new SequenceCanvasView({'model': this.model.get("sequence")});
        },

        onClose: function() {},

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
            this.main_sequence.render(ctx, this.design, 0, 0);
            var final_width = this.main_sequence.getSize().width;
            var final_height = this.main_sequence.getSize().height;
            this.$el.attr({
                "width": final_width + 9,
                "height": final_height + 9
            });
            this.main_sequence.render(ctx, this.design, 4.5, 4.5, final_width);

            $("body").append(this.getDownloadLink());

            return this;
        }
    });
    return StruktogramCanvasView;
});
