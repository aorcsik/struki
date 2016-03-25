define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'text!../../templates/watcher.html',
    'text!../../templates/watcher/context.html'
], function($, _, Backbone, Parser, watcherTemplate, contextTemplate){
    var WatcherView = Backbone.View.extend({
        id: "watcher",
        events: {
            "click .control-run": "delayed_run",
            "click .control-pause": "pause",
            "click .control-back": "back",
            "click .control-next": "next",
            "click .control-reset": "reset"
        },
        template: _.template(watcherTemplate),
        contexttemp: _.template(contextTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.context === undefined) return;
                self.listenTo(self.model.get("context"), "change", function() {
                    self.render();
                });
                this.debug_step = 0;
                this.saved_variables = null;
                self.render();
            });
        },

        onClose: function() {},

        debug_step: 0,
        max_steps: null,
        saved_variables: null,
        run: function() {
            var variables,
                context = this.model.get("context");
            if (this.debug_step === 0) {
                variables = context.get("variables");
                this.$el.find(".form-control").each(function() {
                    variables[$(this).attr("name")] = (new Parser($(this).val())).evaluate(context);
                });
                this.saved_variables = $.extend({}, variables);
            } else {
                variables = $.extend({}, this.saved_variables);
            }
            context.set("variables", variables);
            this.model.run(this.debug_step);
        },

        next: function() {
            this.step(1);
        },

        back: function() {
            this.step(-1);
        },

        button_states: {
            "run": true,
            "pause": false,
            "next": true,
            "back": false,
            "stop": true
        },
        updateButtonState: function(btn, state) {
            this.button_states[btn] = state;
            if (this.button_states.run) this.$el.find(".control-run").removeClass("hide");
            else this.$el.find(".control-run").addClass("hide");
            if (this.button_states.pause) this.$el.find(".control-pause").removeClass("hide");
            else this.$el.find(".control-pause").addClass("hide");

            if (!this.button_states.next) this.$el.find(".control-run").addClass("disabled");
            else this.$el.find(".control-run").removeClass("disabled");

            if (this.button_states.back) this.$el.find(".control-back").removeClass("disabled");
            else this.$el.find(".control-back").addClass("disabled");
            if (this.button_states.next) this.$el.find(".control-next").removeClass("disabled");
            else this.$el.find(".control-next").addClass("disabled");
        },
        updateDebugStep: function(debug_step) {
            this.debug_step = debug_step;
            this.updateDebugCounter();
        },
        updateMaxSteps: function(max_steps) {
            this.max_steps = max_steps;
            this.updateDebugCounter();
        },
        updateDebugCounter: function() {
            var text = "–";
            if (this.max_steps !== null) {
                text = this.debug_step + "/" + this.max_steps;
            }
            this.$el.find(".debug-counter").html(text);
        },

        step: function(dir) {
            if (this.max_steps === null) {
                this.run();
                this.updateMaxSteps(this.model.get("context").get("_state"));
            }
            if ((dir == 1 && this.debug_step < this.max_steps) || (dir == -1 && this.debug_step > 1)) {
                $("#output").data('view').clear();
                $("#output").data('view').log("Started...");
                this.updateDebugStep(this.debug_step + dir);
                try {
                    this.run();
                } catch (e) {
                    if (e !== "DEBUG STOP") throw e;
                }

                this.updateButtonState("back", this.debug_step > 1);
                this.updateButtonState("next", this.debug_step < this.max_steps);
                return true;
            }
            $("#output").data('view').log("Ended.");
            this.updateButtonState("run", true);
            this.updateButtonState("pause", false);
            return false;
        },

        run_delay: null,
        delayed_run: function() {
            var self = this;
            this.run_delay = window.setTimeout(function() {
                self.updateButtonState("run", false);
                self.updateButtonState("pause", true);
                if (self.step(1)) self.delayed_run();
            }, 500);
        },

        pause: function() {
            window.clearTimeout(this.run_delay);
            this.updateButtonState("run", true);
            this.updateButtonState("pause", false);
        },

        reset: function() {
            this.pause();
            this.updateDebugStep(0);
            this.updateMaxSteps(null);
            this.saved_variables = null;
            this.updateButtonState("run", true);
            this.updateButtonState("pause", false);
            this.updateButtonState("back", false);
            this.updateButtonState("next", true);
            if (this.saved_variables) {
                var variables = $.extend({}, this.saved_variables);
                this.model.get("context").set("variables", variables);
            } else {
                this.model.resetContext();
            }
        },

        render: function() {
            if (this.$el.find(".panel-body").size() > 0) {
                this.$el.find(".panel-body").html(this.template({
                    'context_only': true,
                    'contexttemp': this.contexttemp,
                    'context': this.model.get("context")
                }));
            } else {
                this.$el.html(this.template({
                    'context_only': false,
                    'contexttemp': this.contexttemp,
                    'context': this.model.get("context"),
                    'button_states': this.button_states
                }));
            }
            this.$el.data('view', this);
            return this;
        }
    });
    return WatcherView;
});
