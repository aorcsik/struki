define([
    'jquery',
    'underscore',
    'backbone',
    'views/loop',
    'views/command',
    'views/sequence',
    'models/command',
    'models/condition'
], function($, _, Backbone, LoopView, CommandView, SequenceView, Command, Condition){
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
                "top": 5,
                "right": 10,
                "bottom": 5,
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

        render: function() {
            this.main_sequence.addCommand(new CommandView({'model': new Command({'code': "x:=3"})}));
            this.main_sequence.addCommand(new CommandView({'model': new Command({'code': "y:=4+5-6"})}));

            var loop = new LoopView({'model': new Condition({'code': "a < 2"})});
            loop.getSequence().addCommand(new CommandView({'model': new Command({'code': "a:=a+1"})}));
            this.main_sequence.addCommand(loop);

            var ctx = this.el.getContext('2d');
            this.main_sequence.render(ctx, this.design, 50, 50);
            console.log(this.main_sequence.getSize());
            this.main_sequence.render(ctx, this.design, 50, 50, this.main_sequence.getSize().width);
            return this;
        }
    });
    return StruktogramView;
});
