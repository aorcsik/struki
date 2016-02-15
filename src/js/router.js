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
            var branch = new Branch({'condition': new Condition({'code': "x = 1"})});
            branch.get("sequence").addCommand(new Command({'code': "x:=1"}));
            branching.addBranch(branch);
            struki.get("sequence").addCommand(branching);

            struki.get("sequence").addCommand(loop);

            var struktogram = new StruktogramCanvasView({'model': struki});
            $("body").append(struktogram.$el);
            struktogram.render();
        }
    });

    return Router;
});
