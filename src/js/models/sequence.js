define([
    'jquery',
    'underscore',
    'backbone',
    'models/command',
    'models/conditional',
    'models/loop'
], function($, _, Backbone, Command, Conditional, Loop) {
    var Sequence = Backbone.Model.extend({
        _type: "sequence",
        defaults: {},
        initialize: function() {
            this.set("commands", []);
        },
        newCommand: function(data) {
            var command = new Command($.extend({'parent': this}, data));
            this.addCommand(command);
            return command;
        },
        newLoop: function(data) {
            var loop = new Loop($.extend({'parent': this}, data));
            this.addCommand(loop);
            return loop;
        },
        newConditional: function(data) {
            var conditional = new Conditional($.extend({'parent': this}, data));
            this.addCommand(conditional);
            return conditional;
        },
        addCommand: function(command, idx) {
            var self = this;
            if (idx === undefined || idx > this.get("commands").length) {
                this.get("commands").push(command);
                this.trigger('change:add', command, this.get("commands").length - 1);
            } else {
                this.get("commands").splice(idx, 0, command);
                this.trigger('change:add', command, idx);
            }
            this.trigger('change', this);
            this.listenTo(command, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeCommand: function(command) {
            this.removeCommandByIndex(this.get("commands").indexOf(command));
        },
        removeCommandByIndex: function(idx) {
            if (idx > -1 && idx < this.get("commands").length) {
                var removed = this.get("commands").splice(idx, 1);
                this.trigger('change:remove', removed[0], idx);
                this.stopListening(removed[0]);
                this.trigger('change', this);
            }
        },
        toJSON: function() {
            return {
                'type': this._type,
                'commands': this.get("commands").map(function(command) {
                    return command.toJSON();
                })
            };
        },
        fromJSON: function(json) {
            if (json.type && json.type === this._type) {
                this.set({
                    "commands": json.commands.map(function(command_json) {
                        var command;
                        if (command_json.type && command_json.type === "command") {
                            command = new Command({'parent': this});
                        }
                        if (command_json.type && command_json.type === "conditional") {
                            command = new Conditional({'parent': this});
                        }
                        if (command_json.type && command_json.type === "loop") {
                            command = new Loop({'parent': this});
                        }
                        command.fromJSON(command_json);
                        return command;
                    })
                });
            }
        },
        getStruktogram: function() {
            return this.get("parent").getStruktogram();
        },
        evaluate: function(context) {
            var return_value = null;
            for (var i = 0; i < this.get("commands").length; i++) {
                return_value = this.get("commands")[i].evaluate(context);
                if (return_value !== null) return return_value;
            }
            return return_value;
        }
    });
    return Sequence;
});
