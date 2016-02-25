define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Sequence = Backbone.Model.extend({
        type: "sequence",
        defaults: {},
        initialize: function() {
            this.set("commands", []);
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
                'type': "sequence",
                'commands': this.get("commands").map(function(command) {
                    return command.toJSON();
                })
            };
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
