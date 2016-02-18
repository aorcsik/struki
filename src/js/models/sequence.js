define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var Sequence = Backbone.Model.extend({
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
        }
    });
    return Sequence;
});
