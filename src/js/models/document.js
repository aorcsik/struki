define([
    'jquery',
    'underscore',
    'backbone',
    'models/document/struktogram'
], function($, _, Backbone, Struktogram) {
    var Document = Backbone.Model.extend({
        defaults: {},
        initialize: function() {
            var self = this;
            this.set("helpers", []);
        },
        newStruktogram: function(name) {
            var self = this,
                struktogram = new Struktogram({'name': name, 'document': this});
            this.set("struktogram", struktogram);
            this.get("struktogram").get("sequence").newCommand();
            this.listenTo(this.get("struktogram"), 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        newHelper: function() {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                name = this.get("struktogram").get("name") + "_helper" + (helpers.length + 1),
                struktogram = new Struktogram({'name': name, 'helper': true, 'document': this});
            struktogram.get("sequence").newCommand();
            helpers.push(struktogram);
            this.set({'helpers': helpers});
            this.listenTo(struktogram, 'change', function(e) {
                self.trigger('change', e);
            });
            return struktogram;
        },
        removeHelper: function(struktogram) {
            var self = this,
                helpers = this.get("helpers").map(function(helper) { return helper; }),
                idx = helpers.indexOf(struktogram);
            if (idx > -1 && idx < helpers.length) {
                var removed = helpers.splice(idx, 1);
                this.stopListening(removed[0]);
                this.set({'helpers': helpers});
            }
        },
        serialize: function() {
            return {
                'struktogram': this.get("struktogram").serialize(),
                'helpers': this.get("helpers").map(function(helper) { return helper.serialize(); })
            };
        },
        deserialize: function(json) {
            var self = this,
                helpers = [],
                struktogram = new Struktogram({'document': this});
            struktogram.deserialize(json.struktogram);
            json.helpers.map(function(helper_json) {
                var helper = new Struktogram({'document': this});
                helper.deserialize(helper_json);
                helpers.push(helper);
                self.listenTo(helper, 'change', function(e) {
                    // console.log("struktogram -> document", e);
                    self.trigger('change', e);
                });
            });
            this.listenTo(struktogram, 'change', function(e) {
                // console.log("struktogram -> document", e);
                self.trigger('change', e);
            });
            this.set({
                "struktogram": struktogram,
                "helpers": helpers
            });
        }
    });
    return Document;
});
