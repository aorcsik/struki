define([
    'jquery',
    'underscore',
    'backbone',
    'views/browser/loop',
    'views/browser/command',
    'views/browser/branching',
    'text!../../../templates/browser/sequence.html'
], function($, _, Backbone, LoopBrowserView, CommandBrowserView, BranchingBrowserView, sequenceTemplate) {
    var SequenceBrowserView = Backbone.View.extend({
        tagName: "ul",
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
            if (command.type == "branching") return new BranchingBrowserView({'model': command});
        },

        render: function(depth) {
            this.$el.html(this.template({
                "model": this.model
            }));
            for (var i = 0; i < this.commands.length; i++) {
                this.$el.append(this.commands[i].$el);
                this.commands[i].render(depth + 1);
            }
            if (this.commands.length === 0) {
                this.$el.addClass("empty-sequence");
            } else {
                this.$el.removeClass("empty-sequence");
            }
            this.$el.data("depth", depth);
            this.$el.data("view", this);
            return this;
        }
    });
    return SequenceBrowserView;
});
