define([
    'jquery',
    'underscore',
    'backbone',
    'models/document/command',
    'models/document/conditional',
    'models/document/loop'
], function($, _, Backbone, Command, Conditional, Loop) {
    var Sequence = Backbone.Model.extend({
        _type: "sequence",
        defaults: {},
        initialize: function() {
            this.set("commands", []);
        },
        newCommand: function(data) {
            var command = new Command($.extend({'parent': this}, data));
            command._new = true;
            this.addCommand(command);
            return command;
        },
        newLoop: function(data) {
            var loop = new Loop($.extend({'parent': this}, data));
            loop._new = true;
            this.addCommand(loop);
            return loop;
        },
        newConditional: function(data) {
            var conditional = new Conditional($.extend({'parent': this}, data));
            conditional.get("branches")[0]._new = true;
            this.addCommand(conditional);
            return conditional;
        },
        addCommand: function(command, idx) {
            var self = this,
                commands = this.get("commands").map(function(command) { return command; });
            if (idx === undefined || idx > commands.length) {
                idx = commands.length;
                commands.push(command);
            } else {
                commands.splice(idx, 0, command);
            }
            this.trigger('change:add', command, idx);
            this.set({'commands': commands});
            this.listenTo(command, 'change', function(e) {
                // console.log(command._type + " -> sequence", e);
                self.trigger('change', e);
            });
        },
        removeCommand: function(command) {
            this.removeCommandByIndex(this.get("commands").indexOf(command));
        },
        removeCommandByIndex: function(idx) {
            var commands = this.get("commands").map(function(command) { return command; });
            if (idx > -1 && idx < commands.length) {
                var removed = commands.splice(idx, 1);
                this.trigger('change:remove', removed[0], idx);
                this.stopListening(removed[0]);
                this.set({'commands': commands});
            }
        },
        serialize: function() {
            return {
                'type': this._type,
                'commands': this.get("commands").map(function(command) {
                    return command.serialize();
                })
            };
        },
        deserialize: function(json) {
            var self = this;
            if (json.type && json.type === this._type) {
                var commands = json.commands.map(function(command_json) {
                    var command;
                    if (command_json.type && command_json.type === "command") {
                        command = new Command({'parent': self});
                    }
                    if (command_json.type && command_json.type === "conditional") {
                        command = new Conditional({'parent': self});
                    }
                    if (command_json.type && command_json.type === "loop") {
                        command = new Loop({'parent': self});
                    }
                    command.deserialize(command_json);
                    self.listenTo(command, 'change', function(e) {
                        // console.log(command._type + " -> sequence", e);
                        self.trigger('change', e);
                    });
                    return command;
                });
                this.set({"commands": commands});
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
