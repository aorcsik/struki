define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/output.html'
], function($, _, Backbone, outputTemplate){
    var OutputView = Backbone.View.extend({
        id: "output",
        events: {},
        template: _.template(outputTemplate),

        initialize: function() {
        },

        onClose: function() {},

        error: function(err) {
            this.$el.find(".panel-body").prepend($("<div class='text-danger'>" + err + "</div>"));
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
