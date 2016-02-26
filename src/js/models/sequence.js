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
            var self = this,
                commands = this.get("commands");
            if (idx === undefined || idx > commands.length) {
                idx = commands.length;
                commands.push(command);
            } else {
                commands.splice(idx, 0, command);
            }
            this.trigger('change:add', command, idx);
            this.set({
                'commands': commands,
                '_updated_at': (new Date()).getTime()
            });
            // this.trigger('change', this);
            this.listenTo(command, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeCommand: function(command) {
            this.removeCommandByIndex(this.get("commands").indexOf(command));
        },
        removeCommandByIndex: function(idx) {
            var commands = this.get("commands");
            if (idx > -1 && idx < commands.length) {
                var removed = commands.splice(idx, 1);
                this.trigger('change:remove', removed[0], idx);
                this.stopListening(removed[0]);
                this.set({
                    'commands': commands,
                    '_updated_at': (new Date()).getTime()
                });
                // this.trigger('change', this);
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
            var self = this;
            if (json.type && json.type === this._type) {
                json.commands.forEach(function(command_json) {
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
                    self.addCommand(command);
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
