define([], function() {

var token_patterns = [
    {type: "",             pattern: /\s+/},
    {type: "BOOL[%]",      pattern: /(I|H)/},
    {type: "FLOAT[%]",     pattern: /[0-9]*\.[0-9]+/},
    {type: "INTEGER[%]",   pattern: /[0-9]+/},
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
    {type: "OPERATOR_NOT", pattern: /!/},

    {type: "OPERATOR_LST", pattern: /,/}
];

var expression_patterns = [
    {pattern: /BOOL\[(.*?)\]/, operator: "bool"},
    {pattern: /FLOAT\[(.*?)\]/, operator: "float"},
    {pattern: /INTEGER\[(.*?)\]/, operator: "int"},
    {pattern: /VARIABLE\[(.*?)\]/, operator: "var"},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_PROEXPRESSION\[(\d+)\]OPERATOR_PRC/, operator: "func"},
    {pattern: /OPERATOR_PROEXPRESSION\[(\d+)\]OPERATOR_PRC/, operator: "exp"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BROEXPRESSION\[(\d+)\]OPERATOR_BRC/, operator: "array_index"},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BROOPERATOR_BRC/, operator: "array_push"},
    {pattern: /OPERATOR_BROEXPRESSION\[(\d+)\]OPERATOR_BRC/, operator: "array"},

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
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LSTEXPRESSION\[(\d+)\]/, operator: "list"}
];

function Parser(code) {
    this.raw_code = code;
    this.tokenized_code = "";
    this.expression_counter = 0;
    this.expressions = {};
    this.variables = {};

    this.tokenize(this.raw_code);
    this.parse(this.tokenized_code);
}

Parser.prototype.tokenize = function(code) {
    for (var i = 0; i < token_patterns.length; i++) {
        var result = token_patterns[i].pattern.exec(code);
        if (result && result.index === 0) {
            var token = token_patterns[i].type.replace("%", result[0]);
            this.tokenized_code += token;
            return this.tokenize(code.replace(token_patterns[i].pattern, ""));
        }
    }
};

Parser.prototype.parse = function(code) {
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

Parser.prototype.evaluate = function(context) {
    return this.expressions[this.expression_counter - 1].evaluate(context, this.expressions);
};

function Expression(operator, result) {
    this.operator = operator;
    this.result = result;
}

Expression.prototype.evaluate = function(context, expressions) {
    var a, b, c, array_index_expression, keys, value, func;
    if (this.operator == "exp") {
        return expressions[this.result[1]].evaluate(context, expressions);
    } else if (this.operator == "bool") {
        if (this.result[1] == "I") return true;
        if (this.result[1] == "H") return false;
    } else if (this.operator == "float") {
        return parseFloat(this.result[1]);
    } else if (this.operator == "int") {
        return parseInt(this.result[1], 10);
    } else if (this.operator == "sum") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a + b;
        if (a.constructor === Array && b.constructor === Array) return a.concat(b);
        else throw "Compile Error: + operator requires number or array operands";
    } else if (this.operator == "sub") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a - b;
        else throw "Compile Error: - operator requires number operands";
    } else if (this.operator == "mul") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a * b;
        else throw "Compile Error: * operator requires number operands";
    } else if (this.operator == "div") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a / b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: / operator requires number operands";
    } else if (this.operator == "mod") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a % b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: % operator requires number operands";
    } else if (this.operator == "gt") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a > b;
        else throw "Compile Error: > operator requires number operands";
    } else if (this.operator == "gte") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a >= b;
        else throw "Compile Error: >= operator requires number operands";
    } else if (this.operator == "lt") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a < b;
        else throw "Compile Error: < operator requires number operands";
    } else if (this.operator == "lte") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "number" && typeof b === "number") return a <= b;
        else throw "Compile Error: <= operator requires number operands";
    } else if (this.operator == "eq") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === typeof b) return a == b;
        else throw "Compile Error: = operator requires operands of the same type";
    } else if (this.operator == "ne") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === typeof b) return a != b;
        else throw "Compile Error: <> operator requires operands of the same type";
    } else if (this.operator == "and") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "boolean" && typeof b === "boolean") return a && b;
        else throw "Compile Error: & operator requires boolean operands";
    } else if (this.operator == "or") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        b = expressions[this.result[2]].evaluate(context, expressions);
        if (typeof a === "boolean" && typeof b === "boolean") return a || b;
        else throw "Compile Error: | operator requires boolean operands";
    } else if (this.operator == "not") {
        a = expressions[this.result[1]].evaluate(context, expressions);
        if (typeof a === "boolean") return !a;
        else throw "Compile Error: ! operator requires boolean operand";
    } else if (this.operator == "var") {
        return context.getVariable(this.result[1]);
    } else if (this.operator == "func") {
        if (expressions[this.result[1]].operator == "var") {
            value = this.evaluateList(expressions[this.result[2]], context, expressions);
            return context.applyFunction(expressions[this.result[1]].result[1], value);
        }
        throw "Syntax Error: left operand is not a valid function name";
    } else if (this.operator == "array") {
        return this.evaluateList(expressions[this.result[1]], context, expressions);
    } else if (this.operator == "list") {
        return this.evaluateList(this, context, expressions);
    } else if (this.operator == "array_index") {
        keys = this.evaluateArrayIndex(this, context, expressions);
        return context.getArrayValue(keys);
    } else if (this.operator == "set") {
        if (expressions[this.result[1]].operator == "var") {
            a = expressions[this.result[1]].result[1];
            b = expressions[this.result[2]].evaluate(context, expressions);
            return context.setVariable(a, b);
        } else if (expressions[this.result[1]].operator == "array_push") {
            value = expressions[this.result[2]].evaluate(context, expressions);
            array_index_expression = expressions[this.result[1]];
            if (expressions[array_index_expression.result[1]].operator == "var") {
                a = expressions[array_index_expression.result[1]].result[1];
                return context.getVariable(a).push(value);
            } else if (expressions[array_index_expression.result[1]].operator == "array_index") {
                keys = this.evaluateArrayIndex(expressions[array_index_expression.result[1]], context, expressions);
                return context.getArrayValue(keys).push(value);
            }
        } else if (expressions[this.result[1]].operator == "array_index") {
            value = expressions[this.result[2]].evaluate(context, expressions);
            keys = this.evaluateArrayIndex(expressions[this.result[1]], context, expressions);
            return context.setArrayValue(keys, value);
        }
        throw "Syntax Error: left operand is not a valid variable or array syntax";
    }
    throw "Syntax Error: cannot use " + this.operator + " operator here";
};

Expression.prototype.evaluateList = function(list, context, expressions) {
    var sublist, flatlist = [];
    if (list.operator == "list") {
        sublist = this.evaluateList(expressions[list.result[1]], context, expressions);
        sublist.forEach(function(item) { flatlist.push(item); });
        sublist = this.evaluateList(expressions[list.result[2]], context, expressions);
        sublist.forEach(function(item) { flatlist.push(item); });
    } else {
        flatlist.push(list.evaluate(context, expressions));
    }
    return flatlist;
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

    return Parser;
});