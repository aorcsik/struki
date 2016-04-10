define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/ui-settings.html'
], function($, _, Backbone, UISettingsTemplate){
    var UISettingsView = Backbone.View.extend({
        events: {
            "click .btn-primary": "saveSettings"
        },
        template: _.template(UISettingsTemplate),

        initialize: function() {

        },

        saveSettings: function() {
            this.model.set({
                'unsafe': this.$el.find("input[name=unsafe]").is(":checked"),
                'max_iterations': this.$el.find("input[name=max_iterations]").val(),
                'step_delay': this.$el.find("input[name=step_delay]").val()
            });
            this.$el.find(".modal").modal("hide");
        },

        render: function() {
            var self = this;
            this.$el.html(this.template({
                "model": this.model,
            }));
            this.$el.find(".modal").modal("show");
            this.$el.find(".modal").on("hidden.bs.modal", function() {
                self.$el.remove();
                self.close();
            });
            return this;
        }
    });
    return UISettingsView;
});
