// Filename: router.js
define([
    'jquery',
    'underscore',
    'backbone',
    'models/branch',
    'models/branching',
    'models/command',
    'models/condition',
    'models/loop',
    'models/sequence',
    'models/struktogram',
    'models/main',
    'views/canvas/canvas'
], function($, _, Backbone, Branch, Branching, Command, Condition, Loop, Sequence, Struktogram, Main, CanvasView) {

    var Router = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },

        routes: {
            // Default
            '*actions': 'defaultAction'
        },
        defaultAction: function (actions) {
            var main = new Main();
            main.newStruktogram("struki");

            var canvas = new CanvasView({'model': main});
            $("body").append(canvas.$el);
            canvas.render();

            main.get("struktogram").get("sequence").removeCommandByIndex(0);
            main.get("struktogram").get("sequence").addCommand(new Command({'code': "x:=3"}));
            main.get("struktogram").get("sequence").addCommand(new Command({'code': "y:=4+5-6"}));

            var loop = new Loop({'condition': new Condition({'code': "a < 2"})});
            loop.get("sequence").addCommand(new Command({'code': "a:=a+1"}));

            var branching = new Branching();
            branching.get("branches")[0].set("condition", new Condition({'code': "x = 1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("else_branch").get("sequence").addCommand(new Command({'code': "x:=x-1"}));
            main.get("struktogram").get("sequence").addCommand(branching);

            main.get("struktogram").get("sequence").addCommand(loop);

            /* var cmd = null;
            var i = 0;
            window.setInterval(function() {
                if (cmd === null) {
                    cmd = new Command({'code': "x:=" + i++});
                    struki.get("sequence").addCommand(cmd);
                } else {
                    struki.get("sequence").removeCommand(cmd);
                    cmd = null;
                }
                // var c = branch.get("sequence").get("commands")[0].get("code");
                // branch.get("sequence").get("commands")[0].set("code", c + "3");
            }, 500); */
        }
    });

    return Router;
});
