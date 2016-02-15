define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){
    var SequenceView = Backbone.View.extend({
        commands: [],

        initialize: function() {
            this.commands = [];
        },
        onClose: function() {},

        addCommand: function(command) {
            this.commands.push(command);
        },

        size: {
            'width': 0,
            'height': 0
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
    return SequenceView;
});
