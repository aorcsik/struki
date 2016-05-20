define([
    'models/document/abstract_list_element',
    'models/document/command',
    'models/document/conditional',
    'models/document/loop'
], function(AbstractListElement, Command, Conditional, Loop) {
    var Sequence = AbstractListElement.extend({
        _type: "sequence",
        defaults: {},
        initialize: function() {
            this.set("list", []);
        },

        getCommands: function() {
            return this.getListItems();
        },

        addCommand: function(type, command, _new, idx) {
            if (command && command._type === type) {
                command.set('parent', this);
            } else if (type == "command") {
                command = new Command($.extend({'parent': this}, command));
                command._new = _new === undefined ? true : _new;
            } else if (type == "loop") {
                command = new Loop($.extend({'parent': this}, command));
                command._new = _new === undefined ? true : _new;
            } else if (type == "conditional") {
                command = new Conditional($.extend({'parent': this}, command));
                command.getBranches()[0]._new = _new === undefined ? true : _new;
            }
            this.addListItem(command, idx);
            return command;
        },
        removeCommand: function(command) {
            return this.removeListItem(command);
        },

        serialize: function() {
            return {
                'type': this._type,
                'commands': this.getCommands().map(function(command) {
                    return command.serialize();
                })
            };
        },
        deserialize: function(json) {
            if (json.type && json.type === this._type) {
                var self = this;
                json.commands.map(function(command_json) {
                    if (command_json.type && command_json.type === "command") {
                        var command = new Command({'parent': self});
                        command.deserialize(command_json);
                        self.addCommand('command', command);
                    }
                    if (command_json.type && command_json.type === "conditional") {
                        var conditional = new Conditional({'parent': self});
                        conditional.deserialize(command_json);
                        self.addCommand('conditional', conditional);
                    }
                    if (command_json.type && command_json.type === "loop") {
                        var loop = new Loop({'parent': self});
                        loop.deserialize(command_json);
                        self.addCommand('loop', loop);
                    }
                });
            }
        },

        evaluate: function(context) {
            var return_value = null,
                commands = this.getCommands();
            for (var i = 0; i < commands.length; i++) {
                return_value = commands[i].evaluate(context);
                if (return_value !== null) return return_value;
            }
            return return_value;
        }
    });
    return Sequence;
});
