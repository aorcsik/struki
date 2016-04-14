define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/ui-output.html'
], function($, _, Backbone, UIOutputTemplate){
    var UIOutputView = Backbone.View.extend({
        className: "ui-output ui-panel",
        events: {
            "click .control-reset": "clear"
        },
        template: _.template(UIOutputTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, 'started_run', function() {
                self.clear();
            });
            this.listenTo(this.model, 'finished_run', function(result) {
                self.info("Ended.");
                self.result("Result: " + result);
            });
            this.listenTo(this.model, 'flush_output', function(buffer) {
                self.clear();
                self.info("Started...");
                var concat = "";
                buffer.forEach(function(args) {
                    args = Array.prototype.slice.call(args);
                    concat += "<div>" + args.join(", ") + "</div>" + "\n";
                });
                this.$el.find(".panel-body").append(concat);
            });
        },

        onClose: function() {},

        error: function(err) {
            this.$el.find(".panel-body").append($("<div class='text-danger'>" + err + "</div>"));
            this.$el.find(".panel-body").scrollTop(this.$el.find(".panel-body")[0].scrollHeight);
        },
        info: function(info) {
            this.$el.find(".panel-body").append($("<div class='text-info'>" + info + "</div>"));
            this.$el.find(".panel-body").scrollTop(this.$el.find(".panel-body")[0].scrollHeight);
        },
        result: function(success) {
            this.$el.find(".panel-body").append($("<div class='text-success'>" + success + "</div>"));
            this.$el.find(".panel-body").scrollTop(this.$el.find(".panel-body")[0].scrollHeight);
        },
        log: function(type) {
            var args = Array.prototype.slice.call(arguments);
            this.$el.find(".panel-body").append($("<div>" + args.join(", ") + "</div>"));
            this.$el.find(".panel-body").scrollTop(this.$el.find(".panel-body")[0].scrollHeight);
        },
        clear: function() {
            this.$el.find(".panel-body div").remove();
        },

        render: function() {
            this.$el.html(this.template({

            }));
            this.$el.data('view', this);
            return this;
        }
    });
    return UIOutputView;
});
