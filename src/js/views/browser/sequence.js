define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/loop',
    'views/browser/command',
    'views/browser/conditional',
    'text!../../../templates/browser/sequence.html'
], function($, _, Backbone, LoopBrowserView, CommandBrowserView, ConditionalBrowserView, sequenceTemplate) {
    var SequenceBrowserView = Backbone.View.extend({
        tagName: "ul",
        depth: 0,
        className: "sequence sortable-sequence",
        commands: null,
        template: _.template(sequenceTemplate),

        initialize: function() {
            var self = this;
            this.updateCommands();
            this.listenTo(this.model, "change:add", function(command, idx) {
                self.commands.splice(idx, 0, self.createCommandBrowserView(command));
                // console.log("browser:add");
            });
            this.listenTo(this.model, "change:remove", function(command, idx) {
                self.commands.splice(idx, 1);
                // console.log("browser:remove");
            });
        },
        onClose: function() {
            this.commands.forEach(function(command) {
                command.close();
            });
        },
        updateCommands: function() {
            var self = this;
            this.commands = this.model.get("commands").map(function(command) {
                return self.createCommandBrowserView(command);
            });
        },
        createCommandBrowserView: function(command) {
            if (command.type == "loop") return new LoopBrowserView({'model': command});
            if (command.type == "command") return new CommandBrowserView({'model': command});
            if (command.type == "conditional") return new ConditionalBrowserView({'model': command});
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function() {
            this.$el.html(this.template({
                "model": this.model
            }));
            for (var i = 0; i < this.commands.length; i++) {
                this.$el.append(this.commands[i].$el);
                this.commands[i].setDepth(this.depth + 1).render();
            }
            if (this.commands.length === 0) {
                this.$el.addClass("empty-sequence");
            } else {
                this.$el.removeClass("empty-sequence");
            }
            this.$el.data("depth", this.depth);
            this.$el.data("view", this);
            return this;
        }
    });
    return SequenceBrowserView;
});
