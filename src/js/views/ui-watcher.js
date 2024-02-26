define([
    'jquery',
    'underscore',
    'backbone',
    'lib/localization',
    'lib/parser',
    'lib/watcher_error',
    'text!../../templates/ui-watcher.html',
    'text!../../templates/watcher/context.html',
    'text!../../templates/watcher/modal.html'
], function($, _, Backbone, Localization, Parser, WatcherError, UIWatcherTemplate, watcherContextTemplate, watcherModalTemplate){
    var UIWatcherView = Backbone.View.extend({
        className: "ui-watcher ui-panel",
        events: {
            "click .control-run": "delayed_run",
            "click .control-pause": "pause",
            "click .control-back": "back",
            "click .control-next": "next",
            "click .control-reset": "reset"
        },
        template: _.template(UIWatcherTemplate),
        contexttemp: _.template(watcherContextTemplate),
        modaltemp: _.template(watcherModalTemplate),

        initialize: function() {
            var self = this;
            this.listenTo(this.model, "change", function(e) {
                if (e.changed.context === undefined) return;
                self.listenTo(self.model.get("context"), "change", function(e) {
                    //self.render();
                });
                self.softReset();
                self.render(true);  // full render
            });
        },

        onClose: function() {},

        result: null,
        debug_step: 0,
        max_steps: null,
        saved_variables: null,
        run: function(debug_step) {
            var context = this.model.get("context");
            debug_step = debug_step || 0;
            if (debug_step === 0) {
                this.$el.find(".form-control").each(function() {
                    var param_code = $(this).val().replace(/(^\s+|\s+$)/g, "");
                    if (!param_code) throw new WatcherError("empty start parameter");
                    var param_result = (new Parser($(this).val())).evaluate(context);
                    context.setVariableValue($(this).attr("name"), param_result);
                });
                this.saved_variables = $.extend(true, {}, context.get("variables"));
            } else {
                context.set("variables", $.extend(true, {}, this.saved_variables));
            }
            // if unsafe, don't do a full run, just set the state to -1
            if (this.model.get("unsafe") && debug_step === 0) {
                context.set({"_state": -1});
            } else {
                this.result = this.model.run(debug_step);
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
        updateButtonStates: function(button_states) {
            $.extend(this.button_states, button_states);
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
            options = $.extend({'L': Localization}, options);
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
                    self.model.clearOutputBuffer(); // no print in prerun
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
                                self.model.clearOutputBuffer(); // no print in prerun
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
                var debugstop = false,
                    context = this.model.get("context"),
                    can_step_next = (this.max_steps === -1 || this.debug_step <= this.max_steps),
                    can_step_prev = (this.debug_step > 1),
                    can_step = ((dir == 1 && can_step_next) || (dir == -1 && can_step_prev)),
                    context_state = context.get("_state"),
                    is_ended = context_state > -1 && this.debug_step > context_state;
                if (!is_ended && can_step) {
                    this.updateDebugStep(this.debug_step + dir);
                    try {
                        this.run(this.debug_step);
                    } catch (e) {
                        if (context.isError(e)) {
                            this.updateDebugStep(this.debug_step - dir);
                            this.updateButtonStates({
                                'back': this.debug_step > 1,
                                'next': false,
                                'run': true, 'pause': false
                            });
                            return false;
                        }
                        else if (context.isStop(e)) debugstop = true;
                        else throw e;
                    }
                    this.updateButtonStates({
                        'back': this.debug_step > 1,
                        'next': this.max_steps === -1 || this.debug_step <= this.max_steps
                    });
                    this.model.flushOutput();
                    if (debugstop) {
                        self.render();
                        return true;
                    }
                }
                this.updateMaxSteps(context_state);
                this.updateDebugStep(context_state);
                this.updateButtonStates({
                    'next': this.max_steps === -1 || this.debug_step < this.max_steps,
                    'run': true, 'pause': false
                });
                this.model.finishRun(this.result);
                self.render();
                return false;
            }
        },

        run_delay: null,
        delayed_run: function() {
            var self = this;
            if (this.max_steps === null) {
                this.prerun(function() {
                    self.delayed_run();
                });
            } else {
                this.run_delay = window.setTimeout(function() {
                    self.updateButtonStates({'run': false, 'pause': true});
                    if (self.step(1)) self.delayed_run();
                }, this.model.get("step_delay"));
            }
        },

        pause: function() {
            window.clearTimeout(this.run_delay);
            this.updateButtonStates({'run': true, 'pause': false});
        },

        softReset: function() {
            this.result = null;
            this.updateDebugStep(0);
            this.updateMaxSteps(null);
            this.saved_variables = null;
            this.updateButtonStates({
                'run': true, 'pause': false,
                'back': false, 'next': true
            });
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
            if (!full && this.$el.find(".panel-body").length > 0) {
                this.$el.find(".panel-body").html(this.template({
                    'context_only': true,
                    'contexttemp': this.contexttemp,
                    'context': this.model.get("context"),
                    'active_document': this.model.get("active_document")
                }));
            } else {
                this.$el.html(this.template({
                    'context_only': false,
                    'contexttemp': this.contexttemp,
                    'context': this.model.get("context"),
                    'button_states': this.button_states,
                    'active_document': this.model.get("active_document")
                }));
                this.$el.find(".panel-heading a").each(function() {
                    var title = $(this).attr("title");
                    $(this).attr("title", "");
                    $(this).tooltip({
                        'title': function() {
                            return Localization.gettext(title, true);
                        }
                    });
                });
            }
            this.$el.data('view', this);
            this.updateLayout();
            return this;
        },

        updateLayout: function() {
            var output_height = this.model.getOutputHeight();
            var window_width = this.model.getWindowWidth();
            var editor_width = this.model.getEditorWidth(null, 100);
            var output_width = this.model.getOutputWidth(window_width - editor_width, 100);
            this.$el.css({
                'right': 0,
                'bottom': 0,
                'width': window_width - editor_width - output_width,
                'height': output_height
            });
            this.$el.find(".panel-body").css({
                'height': this.$el.height() - this.$el.find(".panel-heading").outerHeight()
            });
        },

    });
    return UIWatcherView;
});
