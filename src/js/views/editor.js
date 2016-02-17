define([
    'jquery',
    'underscore',
    'backbone',
    'models/loop',
    'models/command',
    'models/condition',
    'models/branching',
    'views/canvas/canvas',
    'text!../../templates/editor.html'
], function($, _, Backbone, Loop, Command, Condition, Branching, CanvasView, editorTemplate){
    var EditorView = Backbone.View.extend({
        id: "editor",
        events: {},
        template: _.template(editorTemplate),
        canvas: null,

        initialize: function() {
            this.model.get("struktogram").get("sequence").removeCommandByIndex(0);
            this.model.get("struktogram").get("sequence").addCommand(new Command({'code': "x:=3"}));
            this.model.get("struktogram").get("sequence").addCommand(new Command({'code': "y:=4+5-6"}));

            var loop = new Loop({'condition': new Condition({'code': "a < 2"})});
            loop.get("sequence").addCommand(new Command({'code': "a:=a+1"}));

            var branching = new Branching();
            branching.get("branches")[0].set("condition", new Condition({'code': "x = 1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("else_branch").get("sequence").addCommand(new Command({'code': "x:=x-1"}));
            this.model.get("struktogram").get("sequence").addCommand(branching);

            this.model.get("struktogram").get("sequence").addCommand(loop);

            this.canvas = new CanvasView({'model': this.model});
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            this.$el.find(".canvas-container").append(this.canvas.$el);
            this.canvas.render();
            return this;
        }
    });
    return EditorView;
});
