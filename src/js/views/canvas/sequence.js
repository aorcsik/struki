define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/loop',
    'views/canvas/command',
    'views/canvas/branching'
], function($, _, Backbone, LoopCanvasView, CommandCanvasView, BranchingCanvasView) {
    var SequenceCanvasView = Backbone.View.extend({
        lines: null,
        size: null,
        position: null,
        commands: [],

        initialize: function() {
            var self = this;
            this.size = {
                'width': 0,
                'height': 0
            };
            this.position = {
                "x": 0,
                "y": 0
            };
            this.updateCommands();
            this.listenTo(this.model, "change:add", function(command, idx) {
                self.commands.splice(idx, 0, self.createCommandCanvasView(command));
                // console.log("canvas:add");
            });
            this.listenTo(this.model, "change:remove", function(command, idx) {
                self.commands.splice(idx, 1);
                // console.log("canvas:remove");
            });
        },
        onClose: function() {
            this.commands.forEach(function(command) {
                command.close();
            });
        },

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    this.commands.forEach(function(command) {
                        command.onEvent(event);
                    });
                    return true;
                }
            }
            return false;
        },

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

        getSize: function() {
            return this.size;
        },

        getLines: function() {
            return this.lines;
        },

        render: function(ctx, design, line, x, y, fix_width, lines) {
            this.lines = {};
            this.position.x = x;
            this.position.y = y;
            this.size.width = 0;
            this.size.height = 0;
            for (var i = 0; i < this.commands.length; i++) {
                this.commands[i].render(ctx, design, line, x, y + this.size.height, fix_width, lines);
                this.size.height += this.commands[i].getSize(ctx, design).height;
                this.size.width = fix_width || Math.max(this.size.width, this.commands[i].getSize(ctx, design).width);
                for (var key in this.commands[i].getLines()) {
                    this.lines[key] = this.commands[i].getLines()[key];
                    line = key;
                }
                line++;
            }
            return this;
        }
    });
    return SequenceCanvasView;
});
