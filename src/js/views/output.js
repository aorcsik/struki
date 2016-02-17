define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/output.html'
], function($, _, Backbone, outputTemplate){
    var OutputView = Backbone.View.extend({
        id: "output",
        className: "small-window",
        events: {},
        template: _.template(outputTemplate),

        initialize: function() {
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return OutputView;
});
