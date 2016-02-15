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
    'views/canvas/struktogram'
], function($, _, Backbone, Branch, Branching, Command, Condition, Loop, Sequence, Struktogram, StruktogramCanvasView) {

    var Router = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },

        routes: {
            // Default
            '*actions': 'defaultAction'
        },
        defaultAction: function (actions) {
            var struki = new Struktogram({'name': "struki"});
            struki.get("sequence").addCommand(new Command({'code': "x:=3"}));
            struki.get("sequence").addCommand(new Command({'code': "y:=4+5-6"}));

            var loop = new Loop({'condition': new Condition({'code': "a < 2"})});
            loop.get("sequence").addCommand(new Command({'code': "a:=a+1"}));

            var branching = new Branching();
            branching.get("branches")[0].set("condition", new Condition({'code': "x = 1"}));
            branching.get("branches")[0].get("sequence").addCommand(new Command({'code': "x:=x+1"}));
            branching.get("else_branch").get("sequence").addCommand(new Command({'code': "x:=x-1"}));
            struki.get("sequence").addCommand(branching);

            struki.get("sequence").addCommand(loop);

            var struktogram = new StruktogramCanvasView({'model': struki});
            $("body").append(struktogram.$el);
            struktogram.render();

            var cmd = null;
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
            }, 500);
        }
    });

    return Router;
});
