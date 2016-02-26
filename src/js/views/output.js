define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/output.html'
], function($, _, Backbone, outputTemplate){
    var OutputView = Backbone.View.extend({
        id: "output",
        events: {
            "click .control-reset": "clear"
        },
        template: _.template(outputTemplate),

        initialize: function() {
        },

        onClose: function() {},

        error: function(err) {
            this.$el.find(".panel-body").append($("<div class='text-danger'>" + err + "</div>"));
        },
        log: function() {
            var args = Array.prototype.slice.call(arguments);
            this.$el.find(".panel-body").append($("<div>" + args.join(", ") + "</div>"));
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
    return OutputView;
});
