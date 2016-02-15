function Command(code) {
    this.code = code;
}

function Condition(code) {
    this.code = code;
}

function Sequence() {
    this.commands = [];
}

Sequence.prototype.addCommand = function(command) {
    this.commands.push(command);
};
Sequence.prototype.removeCommand = function(idx) {
    this.commands.splice(idx, 1);
};

function Branching(condition) {
    this.conditions = [
        condition
    ];
    this.branches = [
        new Sequence(),
        new Sequence()
    ];
}

Branching.prototype.addCondition = function(condition) {
    this.conditions.push(condition);
    if (this.branches.length < this.conditions.length) {
        this.branches.push(new Sequence);
    }
}
Branching.prototype.removeCondition = function(condition) {
    this.conditions.push(condition);
    if (this.branches.length < this.conditions.length) {
        this.branches.push(new Sequence);
    }
}
