var token_patterns = [
    {type: "",             pattern: /\s+/},
    {type: "FLOAT[%]",     pattern: /-?[0-9]*\.[0-9]+/},
    {type: "INTEGER[%]",   pattern: /-?[0-9]+/},
    {type: "VARIABLE[%]",  pattern: /[_a-zA-Z][_0-9a-zA-Z]*/},
    {type: "OPERATOR_BRO", pattern: /\[/},
    {type: "OPERATOR_BRC", pattern: /\]/},
    {type: "OPERATOR_PRO", pattern: /\(/},
    {type: "OPERATOR_PRC", pattern: /\)/},
    {type: "OPERATOR_SUM", pattern: /\+/},
    {type: "OPERATOR_SUB", pattern: /-/},
    {type: "OPERATOR_DIV", pattern: /\//},
    {type: "OPERATOR_MUL", pattern: /\*/},
    {type: "OPERATOR_MOD", pattern: /%/},
    {type: "OPERATOR_SET", pattern: /:=/},
    {type: "OPERATOR_LTE", pattern: /<=/},
    {type: "OPERATOR_GTE", pattern: />=/},
    {type: "OPERATOR_NE",  pattern: /<>/},
    {type: "OPERATOR_LT",  pattern: /</},
    {type: "OPERATOR_GT",  pattern: />/},
    {type: "OPERATOR_EQ",  pattern: /=/},
    {type: "OPERATOR_NOT", pattern: /!/}
];

var expression_patterns = [
    {pattern: /FLOAT\[(.*?)\]/, operator: "float"},
    {pattern: /INTEGER\[(.*?)\]/, operator: "int"},
    {pattern: /VARIABLE\[(.*?)\]/, operator: "var"},
    {pattern: /OPERATOR_PROEXPRESSION\[(\d+)\]OPERATOR_PRC/, operator: "exp"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BROEXPRESSION\[(\d+)\]OPERATOR_BRC/, operator: "array_index"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_MULEXPRESSION\[(\d+)\]/, operator: "mul"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_DIVEXPRESSION\[(\d+)\]/, operator: "div"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUMEXPRESSION\[(\d+)\]/, operator: "sum"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUBEXPRESSION\[(\d+)\]/, operator: "sub"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SETEXPRESSION\[(\d+)\]/, operator: "set"},
];

function StructogramCellParser(code) {
    this.context = new Context();
    this.raw_code = code;
    this.tokenized_code = "";
    this.expression_counter = 0;
    this.expressions = {};
    this.variables = {};

    this.tokenize(this.raw_code);
    this.parse(this.tokenized_code);
}

StructogramCellParser.prototype.tokenize = function(code) {
    for (var i = 0; i < token_patterns.length; i++) {
        var result = token_patterns[i].pattern.exec(code);
        if (result && result.index === 0) {
            var token = token_patterns[i].type.replace("%", result[0]);
            this.tokenized_code += token;
            return this.tokenize(code.replace(token_patterns[i].pattern, ""));
        }
    }
};

StructogramCellParser.prototype.parse = function(code) {
    for (var i = 0; i < expression_patterns.length; i++) {
        var result = expression_patterns[i].pattern.exec(code);
        if (result) {
            var expression_num = this.expression_counter++;
            this.expressions[expression_num] = new Expression(expression_patterns[i].operator, result);
            return this.parse(code.replace(result[0], "EXPRESSION[" + expression_num + "]"));
        }
    }
};

StructogramCellParser.prototype.evaluate = function(context) {
    this.expressions[this.expression_counter - 1].evaluate(context, this.expressions);
};

function Expression(operator, result) {
    this.operator = operator;
    this.result = result;
}

Expression.prototype.evaluate = function(context, expressions) {
    var a, b;
    if (this.operator == "exp") {
        return expressions[this.result[1]].evaluate(context, expressions);
    } else if (this.operator == "float") {
        return parseFloat(this.result[1]);
    } else if (this.operator == "int") {
        return parseInt(this.result[1], 10);
    } else if (this.operator == "var") {
        a = this.result[1];
        return context.getVariable(a);
    } else if (this.operator == "array_index") {
        if (expressions[this.result[1]].operator == "var") {
            a = expressions[this.result[1]].result[1];
            b = expressions[this.result[2]].evaluate(context, expressions);
            return context.getVariable(a)[b];
        }
        throw "Syntax Error: not an array";
    } else if (this.operator == "sum") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a + b;
    } else if (this.operator == "sub") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a - b;
    } else if (this.operator == "mul") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a * b;
    } else if (this.operator == "div") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a / b;
    } else if (this.operator == "set") {
        if (expressions[this.result[1]].operator == "var") {
            a = expressions[this.result[1]].result[1];
            b = expressions[this.result[2]].evaluate(context, expressions);
            context.setVariable(a, b);
        }
        else if (expressions[this.result[1]].operator == "array_index") {
            var array_index_expression = expressions[this.result[1]];
            if (expressions[array_index_expression.result[1]].operator == "var") {
                a = expressions[array_index_expression.result[1]].result[1];
                b = expressions[array_index_expression.result[2]].evaluate(context, expressions);
                c = expressions[this.result[2]].evaluate(context, expressions);
                context.getVariable(a)[b] = c;
            }
        }
        else throw "Syntax Error: left operand is not a variable";
    }
    else throw "Syntax Error: what??? " + this.operator;
};

function Context() {
    this.variables = {};
}

Context.prototype.setVariable = function(name, value) {
    this.variables[name] = value;
};

Context.prototype.getVariable = function(name) {
    if (this.variables[name] !== undefined) {
        return this.variables[name];
    }
    throw "Compile Error: undefined variable '" + name + "'";
};


var ct = new Context();
ct.setVariable("x", 1);
ct.setVariable("a", []);
var pc = new StructogramCellParser("a[x - 1] := (1 - x) * 3");
pc.evaluate(ct);
console.log(ct.getVariable("a"));
