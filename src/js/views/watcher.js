define([
    'jquery',
    'underscore',
    'backbone',
    'lib/parser',
    'text!../../templates/watcher.html',
    'text!../../templates/watcher/context.html',
    'text!../../templates/watcher/modal.html'
], function($, _, Backbone, Parser, watcherTemplate, contextTemplate, modalTemplate){
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
        modaltemp: _.template(modalTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.context === undefined) return;
                self.listenTo(self.model.get("context"), "change", function(e) {
                    self.render();
                });
                self.softReset();
                self.render(true);  // full render
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
            // if unsafe, don't do a full run, just set the state to -1
            if (this.model.get("unsafe") && this.debug_step == 0) {
                context.set({"_state": -1});
            } else {
                this.model.run(this.debug_step);
            }
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

        openModal: function(options) {
            var $modal = $(this.modaltemp(options)).appendTo($("body")).on("hidden.bs.modal", function() {
                if (options.onHide) options.onHide();
                $modal.remove();
            }).on("shown.bs.modal", function() {
                if (options.onShow) options.onShow();
            }).modal("show");
            return $modal;
        },

        openErrorModal: function(e) {
            this.openModal({
                'title': "",
                'body': "<p class='text-danger'><i class='material-icons'>&#xE8B2;</i> " + e + "</p>",
                'footer': true
            });
        },

        prerun: function(cb) {
            var $modal, self = this;
            if (this.model.get("unsafe")) {
                try {
                    self.run();
                    self.updateMaxSteps(self.model.get("context").get("_state"));
                    cb();
                } catch (e) {
                    this.openErrorModal(e);
                }
            } else {
                $modal = this.openModal({
                    'title': "",
                    'body': "<p>Compiling and prerunning struktogram, please wait...</p>",
                    'footer': false,
                    'onShow': function() {
                        window.setTimeout(function() {
                            try {
                                self.run();
                                self.updateMaxSteps(self.model.get("context").get("_state"));
                                $modal.modal('hide');
                                cb();
                            } catch (e) {
                                $modal.modal('hide');
                                self.openErrorModal(e);
                            }
                        }, 300);
                    }
                });
            }
        },

        step: function(dir) {
            var self = this;
            if (this.max_steps === null) {
                this.prerun(function() {
                    self.step(dir);
                });
                return false;
            } else {
                var self = this,
                    context = this.model.get("context"),
                    can_step_next = (dir == 1 && (this.max_steps === -1 || this.debug_step < this.max_steps)),
                    can_step_prev = (dir == -1 && this.debug_step > 1),
                    can_step = (can_step_next || can_step_prev),
                    context_state = context.get("_state"),
                    is_ended = context_state > -1 && this.debug_step > context_state;
                if (!is_ended && can_step) {
                    $("#output").data('view').clear();
                    $("#output").data('view').log("Started...");
                    this.updateDebugStep(this.debug_step + dir);
                    try {
                        this.run();
                    } catch (e) {
                        if (e !== "DEBUG STOP") throw e;
                    }
                    this.updateButtonState("back", this.debug_step > 1);
                    this.updateButtonState("next", this.max_steps === -1 || this.debug_step < this.max_steps);
                    return true;
                }
                this.updateMaxSteps(context_state);
                this.updateDebugStep(context_state);
                this.updateButtonState("next", this.max_steps === -1 || this.debug_step < this.max_steps);
                $("#output").data('view').log("Ended.");
                this.updateButtonState("run", true);
                this.updateButtonState("pause", false);
                this.model.finishRun();
                return false;
            }
        },

        run_delay: null,
        delayed_run: function() {
            var self = this;
            if (this.max_steps === null) {
                this.prerun(function() {
                    self.delayed_run();
                })
            } else {
                this.run_delay = window.setTimeout(function() {
                    self.updateButtonState("run", false);
                    self.updateButtonState("pause", true);
                    if (self.step(1)) self.delayed_run();
                }, this.model.get("step_delay"));
            }
        },

        pause: function() {
            window.clearTimeout(this.run_delay);
            this.updateButtonState("run", true);
            this.updateButtonState("pause", false);
        },

        softReset: function() {
            this.updateDebugStep(0);
            this.updateMaxSteps(null);
            this.saved_variables = null;
            this.updateButtonState("run", true);
            this.updateButtonState("pause", false);
            this.updateButtonState("back", false);
            this.updateButtonState("next", true);
        },

        reset: function() {
            this.pause();
            this.softReset();
            if (this.saved_variables) {
                var variables = $.extend({}, this.saved_variables);
                this.model.get("context").set("variables", variables);
            } else {
                this.model.resetContext();
            }
        },

        render: function(full) {
            if (!full && this.$el.find(".panel-body").size() > 0) {
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
