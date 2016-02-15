define([
    'jquery',
    'underscore',
    'backbone',
    'views/loop',
    'views/command',
    'views/sequence',
    'views/branching',
    'views/branch',
    'models/command',
    'models/condition'
], function($, _, Backbone, LoopView, CommandView, SequenceView, BranchingView, BranchView, Command, Condition){
    var StruktogramView = Backbone.View.extend({
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
            console.log("Struktogram View initialized");
            this.main_sequence = new SequenceView();
        },

        onClose: function() {

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
            this.main_sequence.addCommand(new CommandView({'model': new Command({'code': "x:=3"})}));
            this.main_sequence.addCommand(new CommandView({'model': new Command({'code': "y:=4+5-6"})}));

            var loop = new LoopView({'model': new Condition({'code': "a < 2"})});
            loop.getSequence().addCommand(new CommandView({'model': new Command({'code': "a:=a+1"})}));


            var branching = new BranchingView();
            var branch = new BranchView({'model': new Condition({'code': "x = 1"})});
            branch.getSequence().addCommand(new CommandView({'model': new Command({'code': "x:=1"})}));
            branching.addBranch(branch);
            /* branch = new BranchView({'model': new Condition({'code': "x = 2 & y= 10"})});
            branch.getSequence().addCommand(new CommandView({'model': new Command({'code': "x:=1"})}));
            branching.addBranch(branch); */
            loop.getSequence().addCommand(branching);

            this.main_sequence.addCommand(loop);

            var ctx = this.el.getContext('2d');
            this.main_sequence.render(ctx, this.design, 0, 0);

            var final_width = this.main_sequence.getSize().width;
            var final_height = this.main_sequence.getSize().height;
            this.$el.attr({"width": final_width + 9, "height": final_height + 9});
            this.main_sequence.render(ctx, this.design, 4.5, 4.5, final_width);

            $("body").append(this.getDownloadLink());

            return this;
        }
    });
    return StruktogramView;
});
