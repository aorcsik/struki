define([
    'models/document/abstract_list_element',
    'models/document/struktogram'
], function(AbstractListElement, Struktogram) {
    var Document = AbstractListElement.extend({
        _type: "document",
        defaults: {},
        initialize: function() {
            var self = this,
                struktogram = new Struktogram({'name': "main", 'document': this});
            struktogram.getSequence().addCommand('command', {'code': "return 0"}, false);
            this.listenTo(struktogram, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({
                "uuid": uuid(),
                "name": this.getName() || "new",
                "struktogram": struktogram,
                "list": []
            });
        },

        getUUID: function() {
            return this.get("uuid");
        },
        getName: function() {
            return this.get("name");
        },
        getStruktogram: function() {
            return this.get("struktogram");
        },
        getHelpers: function() {
            return this.getListItems();
        },

        addHelper: function(helper, _new, idx) {
            var struktogram;
            if (helper && helper._type === "struktogram") {
                struktogram = helper;
                struktogram.set({'helper': true, 'document': this});
            } else {
                var name = this.getStruktogram().getName() + "_helper" + (this.getHelpers().length + 1);
                struktogram = new Struktogram($.extend({'name': name, 'helper': true, 'document': this}, helper));
                struktogram.getSequence().addCommand('command', {'code': "return 0"}, false);
                struktogram._new = _new === undefined ? true : _new;
            }
            this.addListItem(struktogram, idx);
            return struktogram;
        },
        removeHelper: function(helper) {
            return this.removeListItem(helper);
        },

        /** Serializable */
        serialize: function() {
            return {
                'type': this._type,
                'uuid': this.getUUID(),
                'name': this.getName(),
                'struktogram': this.getStruktogram().serialize(),
                'helpers': this.getHelpers().map(function(helper) { return helper.serialize(); })
            };
        },
        deserialize: function(json) {
            var self = this,
                struktogram = new Struktogram({'document': this});
            json.struktogram.name = "main";
            struktogram.deserialize(json.struktogram);
            this.listenTo(struktogram, 'change', function(e) {
                self.trigger('change', e);
            });
            this.set({
                "uuid": uuid(),
                "name": json.name || "noname",
                "struktogram": struktogram,
                "list": []
            });
            json.helpers.forEach(function(helper_json) {
                var helper = new Struktogram({'document': self});
                helper.deserialize(helper_json);
                self.addHelper(helper);
            });
        },

        /** Evaluable */
        evaluate: function(context) {
            var main = this.getStruktogram(),
                parameter_list = main.getParameters().map(function(parameter) {
                    return parameter.getName();
                }).join(","),
                code = "return " + main.getName() + "(" + parameter_list + ")";
            return context.evaluateCode(code);
        }
    });
    return Document;
});
