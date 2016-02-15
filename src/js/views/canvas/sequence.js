define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/loop',
    'views/canvas/command',
    'views/canvas/branching'
], function($, _, Backbone, LoopCanvasView, CommandCanvasView, BranchingCanvasView) {
    var SequenceCanvasView = Backbone.View.extend({
        size: null,
        commands: [],

        initialize: function() {
            var self = this;
            this.size = {
                'width': 0,
                'height': 0
            };
            this.updateCommands();
            this.listenTo(this.model, "change:add", function(command, idx) {
                self.commands.splice(idx, 0, self.createCommandCanvasView(command));
            });
            this.listenTo(this.model, "change:remove", function(command, idx) {
                self.commands.splice(idx, 1);
            });
        },
        onClose: function() {},

        updateCommands: function() {
            var self = this;
            this.commands = this.model.get("commands").map(function(command) {
                return self.createCommandCanvasView(command);
            });
        },

        createCommandCanvasView: function(command) {
            if (command.type == "loop") return new LoopCanvasView({'model': command});
            if (command.type == "command") return new CommandCanvasView({'model': command});
            if (command.type == "branching") return new BranchingCanvasView({'model': command});
        },

        getSize: function(ctx, design) {
            return this.size;
        },

        render: function(ctx, design, x, y, fix_width) {
            this.size.width = 0;
            this.size.height = 0;
            for (var i = 0; i < this.commands.length; i++) {
                this.commands[i].render(ctx, design, x, y + this.size.height, fix_width);
                this.size.height += this.commands[i].getSize(ctx, design).height;
                this.size.width = fix_width || Math.max(this.size.width, this.commands[i].getSize(ctx, design).width);
            }
            return this;
        }
    });
    return SequenceCanvasView;
});
