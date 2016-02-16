define([
    'jquery',
    'underscore',
    'backbone',
    'views/canvas/branch'
], function($, _, Backbone, BranchCanvasView){
    var BranchingCanvasView = Backbone.View.extend({
        lines: 0,
        size: null,
        position: null,
        branches: null,
        else_branch: null,
        initialize: function() {
            this.size = {
                'width': 0,
                'height': 0
            };
            this.position = {
                "x": 0,
                "y": 0
            };
            this.branches = this.model.get("branches").map(function(branch) {
                return new BranchCanvasView({'model': branch});
            });
            this.listenTo(this.model, "change:add", function(branch, idx) {
                self.branches.splice(idx, 0, new BranchCanvasView({'model': branch}));
            });
            this.listenTo(this.model, "change:remove", function(branch, idx) {
                self.branches.splice(idx, 1);
            });
            this.else_branch = new BranchCanvasView({'model': this.model.get("else_branch")});
        },
        onClose: function() {},

        onEvent: function(event) {
            if (event.x > this.position.x && event.x < this.position.x + this.size.width) {
                if (event.y > this.position.y && event.y < this.position.y + this.size.height) {
                    this.branches.forEach(function(branch) {
                        branch.onEvent(event);
                    });
                    this.else_branch.onEvent(event);
                    return true;
                }
            }
            return false;
        },

        getSize: function() {
            return this.size;
        },

        getLines: function() {
            return this.lines;
        },

        render: function(ctx, design, line, x, y, fix_width, lines) {
            var key;
            this.lines = {};
            this.position.x = x;
            this.position.y = y;
            var branch_fix_width, else_branch_fix_width, solo = 0;
            var old_size = {
                'width': this.size.width,
                'height': this.size.height
            };
            this.size.width = 0;
            this.size.height = 0;
            if (fix_width) {
                else_branch_fix_width = fix_width;
            }
            for (var i = 0; i < this.branches.length; i++) {
                if (fix_width) {
                    if (this.branches.length == 1) {
                        solo = fix_width;
                    }
                    branch_fix_width = Math.floor(fix_width * this.branches[i].getSize().width / old_size.width);
                    else_branch_fix_width -= branch_fix_width;
                }
                this.branches[i].render(ctx, design, line, x + this.size.width, y, branch_fix_width, lines, null, solo);
                this.size.width += this.branches[i].getSize().width;
                this.size.height = Math.max(this.size.height, this.branches[i].getSize().height);
                for (key in this.branches[i].getLines()) {
                    if (this.lines[key]) this.lines[key] = Math.max(this.lines[key], this.branches[i].getLines()[key]);
                    else this.lines[key] = this.branches[i].getLines()[key];
                }
            }
            var else_text = this.branches.length > 1 ? "else" : "";
            this.else_branch.render(ctx, design, line, x + this.size.width, y, else_branch_fix_width, lines, else_text, null);
            this.size.width += this.else_branch.getSize().width;
            this.size.height = Math.max(this.size.height, this.else_branch.getSize().height);
            for (key in this.else_branch.getLines()) {
                if (this.lines[key]) this.lines[key] = Math.max(this.lines[key], this.else_branch.getLines()[key]);
                else this.lines[key] = this.else_branch.getLines()[key];
            }

            this.size.height = 0;
            for (key in this.lines) {
                this.size.height += this.lines[key];
            }

            if (fix_width) {
                this.size.height = 0;
                for (key in this.lines) {
                    this.size.height += lines[key];
                }
                ctx.strokeRect(
                    x,
                    y,
                    fix_width || this.size.width,
                    this.size.height);
            }
            return this;
        }
    });
    return BranchingCanvasView;
});
