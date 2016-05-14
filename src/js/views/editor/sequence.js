define([
    'jquery',
    'underscore',
    'backbone',
    'views/editor/loop',
    'views/editor/command',
    'views/editor/conditional',
    'text!../../../templates/editor/sequence.html'
], function($, _, Backbone, EditorLoopView, EditorCommandView, EditorConditionalView, editorSequenceTemplate) {
    var EditorSequenceView = Backbone.View.extend({
        tagName: "ul",
        depth: 0,
        className: "sequence sortable-sequence",
        commands: null,
        template: _.template(editorSequenceTemplate),

        initialize: function() {
            var self = this;
            this.updateCommands();
        },
        onClose: function() {
            this.commands.forEach(function(command) {
                command.close();
            });
        },
        updateCommands: function() {
            var self = this;
            this.commands = this.model.get("commands").map(function(command) {
                return self.createEditorCommandView(command);
            });
        },
        createEditorCommandView: function(command) {
            if (command._type == "loop") return new EditorLoopView({'model': command});
            if (command._type == "command") return new EditorCommandView({'model': command});
            if (command._type == "conditional") return new EditorConditionalView({'model': command});
        },
        setDepth: function(depth) {
            this.depth = depth;
            return this;
        },
        render: function() {
            this.$el.html(this.template({
                "empty": this.commands.length === 0,
                "depth": this.depth + 1,
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
    return EditorSequenceView;
});
