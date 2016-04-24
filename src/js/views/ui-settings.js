define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'text!../../templates/ui-settings.html'
], function($, _, Backbone, Localization, UISettingsTemplate){
    var UISettingsView = Backbone.View.extend({
        events: {
            "click .btn-primary": "saveSettings"
        },
        template: _.template(UISettingsTemplate),

        initialize: function() {

        },

        saveSettings: function() {
            var locale = this.$el.find("input[name=language]:checked").val();
            this.model.set({
                'locale': this.$el.find("input[name=language]:checked").val(),
                'unsafe': this.$el.find("input[name=unsafe]").is(":checked"),
                'max_iterations': this.$el.find("input[name=max_iterations]").val(),
                'step_delay': this.$el.find("input[name=step_delay]").val()
            });
            this.$el.find(".modal").modal("hide");
        },

        render: function() {
            var self = this;
            this.$el.html(this.template({
                "L": Localization,
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
