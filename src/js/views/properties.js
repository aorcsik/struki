define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/properties.html'
], function($, _, Backbone, propertiesTemplate){
    var PropertiesView = Backbone.View.extend({
        id: "properties",
        className: "small-window",
        events: {},
        template: _.template(propertiesTemplate),

        initialize: function() {
        },

        onClose: function() {},

        render: function() {
            this.$el.html(this.template({

            }));
            return this;
        }
    });
    return PropertiesView;
});
