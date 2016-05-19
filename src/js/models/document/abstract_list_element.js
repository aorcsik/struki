define([
    'models/document/abstract_element'
], function(AbstractElement) {
    var AbstractListElement = AbstractElement.extend({
        getListItems: function() {
            return this.get("list").map(function(list_item) { return list_item; });
        },
        addListItem: function(list_item, idx) {
            var self = this,
                list = this.getListItems();
            if (idx === undefined || idx > list.length) {
                idx = list.length;
                list.push(list_item);
            } else {
                list.splice(idx, 0, list_item);
            }
            this.trigger('change:add', list_item, idx);
            this.set({'list': list});
            this.listenTo(list_item, 'change', function(e) {
                self.trigger('change', e);
            });
        },
        removeListItem: function(list_item) {
            return this.removeListItemByIndex(this.get("list").indexOf(list_item));
        },
        removeListItemByIndex: function(idx) {
            var list = this.getListItems();
            if (idx > -1 && idx < list.length) {
                var removed_item = list.splice(idx, 1)[0];
                this.trigger('change:remove', removed_item, idx);
                this.stopListening(removed_item);
                this.set({'list': list});
                return removed_item;
            }
            return null;
        }
    });
    return AbstractListElement;
});
