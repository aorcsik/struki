define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../templates/watcher.html'
], function($, _, Backbone, watcherTemplate){
    var WatcherView = Backbone.View.extend({
        id: "watcher",
        events: {},
        template: _.template(watcherTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.context === undefined) return;
                self.listenTo(self.model.get("context"), "change", function() {
                    self.render();
                });
                self.render();
            });
        },

        onClose: function() {},

        runStruktogram: function() {
            var variables = this.model.get("context").get("variables");
            this.$el.find(".form-control").each(function() {
                variables[$(this).attr("name")] = $(this).val();
            });
            this.model.get("context").set("variables", variables);
            this.model.runStruktogram();
        },

        render: function() {
            this.$el.html(this.template({
                'context': this.model.get("context")
            }));
            this.$el.data('view', this);
            return this;
        }
    });
    return WatcherView;
});
