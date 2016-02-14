var token_patterns = [
    {type: "",             pattern: /\s+/},
    {type: "BOOL[%]",      pattern: /(I|H)/},
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
    {type: "OPERATOR_AND", pattern: /&/},
    {type: "OPERATOR_OR",  pattern: /\|/},
    {type: "OPERATOR_NOT", pattern: /!/}
];

var expression_patterns = [
    {pattern: /BOOL\[(.*?)\]/, operator: "bool"},
    {pattern: /FLOAT\[(.*?)\]/, operator: "float"},
    {pattern: /INTEGER\[(.*?)\]/, operator: "int"},
    {pattern: /VARIABLE\[(.*?)\]/, operator: "var"},

    {pattern: /OPERATOR_PROEXPRESSION\[(\d+)\]OPERATOR_PRC/, operator: "exp"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BROEXPRESSION\[(\d+)\]OPERATOR_BRC/, operator: "array_index"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BROOPERATOR_BRC/, operator: "array_push"},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_MULEXPRESSION\[(\d+)\]/, operator: "mul"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_DIVEXPRESSION\[(\d+)\]/, operator: "div"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_MODEXPRESSION\[(\d+)\]/, operator: "mod"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUMEXPRESSION\[(\d+)\]/, operator: "sum"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUBEXPRESSION\[(\d+)\]/, operator: "sub"},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_GTEXPRESSION\[(\d+)\]/,  operator: "gt"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_GTEEXPRESSION\[(\d+)\]/, operator: "gte"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LTEXPRESSION\[(\d+)\]/,  operator: "lt"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LTEEXPRESSION\[(\d+)\]/, operator: "lte"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_EQEXPRESSION\[(\d+)\]/,  operator: "eq"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_NEEXPRESSION\[(\d+)\]/,  operator: "ne"},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_ANDEXPRESSION\[(\d+)\]/, operator: "and"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_OREXPRESSION\[(\d+)\]/,  operator: "or"},
    {pattern: /OPERATOR_NOTEXPRESSION\[(\d+)\]/,                    operator: "not"},

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
    if (!code.match(/^EXPRESSION\[\d+\]$/)) {
        throw "Compile Error: unresolved tokens '" + code.replace(/EXPRESSION\[\d+\]/g, ";").replace(/(^;|;$)/g, "").split(";") + "'";
    }
};

StructogramCellParser.prototype.evaluate = function(context) {
    return this.expressions[this.expression_counter - 1].evaluate(context, this.expressions);
};

function Expression(operator, result) {
    this.operator = operator;
    this.result = result;
}

Expression.prototype.evaluate = function(context, expressions) {
    var a, b, c, array_index_expression, keys, value;
    if (this.operator == "exp") {
        return expressions[this.result[1]].evaluate(context, expressions);
    } else if (this.operator == "bool") {
        if (this.result[1] == "I") return true;
        if (this.result[1] == "H") return false;
    } else if (this.operator == "float") {
        return parseFloat(this.result[1]);
    } else if (this.operator == "int") {
        return parseInt(this.result[1], 10);
    } else if (this.operator == "var") {
        a = this.result[1];
        return context.getVariable(a);
    } else if (this.operator == "array_index") {
        keys = this.evaluateArrayIndex(this, context, expressions);
        return context.getArrayValue(keys);
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
    } else if (this.operator == "mod") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a % b;
    } else if (this.operator == "gt") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a > b;
    } else if (this.operator == "gte") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a >= b;
    } else if (this.operator == "lt") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a < b;
    } else if (this.operator == "lte") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a <= b;
    } else if (this.operator == "eq") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a == b;
    } else if (this.operator == "ne") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a != b;
    } else if (this.operator == "and") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a && b;
    } else if (this.operator == "or") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        return a || b;
    } else if (this.operator == "not") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        return !a;
    } else if (this.operator == "set") {
        if (expressions[this.result[1]].operator == "var") {
            a = expressions[this.result[1]].result[1];
            b = expressions[this.result[2]].evaluate(context, expressions);
            context.setVariable(a, b);
        } else if (expressions[this.result[1]].operator == "array_push") {
            value = expressions[this.result[2]].evaluate(context, expressions);
            array_index_expression = expressions[this.result[1]];
            if (expressions[array_index_expression.result[1]].operator == "var") {
                a = expressions[array_index_expression.result[1]].result[1];
                context.getVariable(a).push(value);
            } else if (expressions[array_index_expression.result[1]].operator == "array_index") {
                keys = this.evaluateArrayIndex(expressions[array_index_expression.result[1]], context, expressions);
                context.getArrayValue(keys).push(value);
            }
        } else if (expressions[this.result[1]].operator == "array_index") {
            value = expressions[this.result[2]].evaluate(context, expressions);
            keys = this.evaluateArrayIndex(expressions[this.result[1]], context, expressions);
            context.setArrayValue(keys, value);
        }
        else throw "Syntax Error: left operand is not a variable";
    }
    else throw "Syntax Error: what??? " + this.operator;
};

Expression.prototype.evaluateArrayIndex = function(expression, context, expressions) {
    var keys;
    if (expressions[expression.result[1]].operator == "var") {
        keys = [expressions[expression.result[1]].result[1]];
    } else if (expressions[expression.result[1]].operator == "array_index"){
        keys = this.evaluateArrayIndex(expressions[expression.result[1]], context, expressions);
    } else throw "Syntax Error: bad array syntax";
    keys.push(expressions[expression.result[2]].evaluate(context, expressions));
    return keys;
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

Context.prototype.getArrayValue = function(keys) {
    var array = this.getVariable(keys[0]);
    for (var i = 1; i < keys.length - 1; i++) {
        array = array[keys[i]];
    }
    return array[keys[i]];
};

Context.prototype.setArrayValue = function(keys, value) {
    var array = this.getVariable(keys[0]);
    for (var i = 1; i < keys.length - 1; i++) {
        array = array[keys[i]];
    }
    array[keys[i]] = value;
};


var ct = new Context();
ct.setVariable("x", 1);
ct.setVariable("a", [[],[]]);
var pc = new StructogramCellParser("a[1][] := (1 + x) * 3");
pc.evaluate(ct);
pc = new StructogramCellParser("a[0][] := (1 + a[1][0]) * 6");
pc.evaluate(ct);
console.log(ct.getVariable("a"));
pc = new StructogramCellParser("!(I | H)");
console.log(pc.evaluate(ct));
