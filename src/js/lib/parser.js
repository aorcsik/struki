define([], function() {

var token_patterns = [
    {type: "CHAR[%]",      pattern: /'([^\\']|\\'|\\\\)'/},
    {type: "",             pattern: /\s+/},
    {type: "BOOL[%]",      pattern: /(I|H)/},
    {type: "FLOAT[%]",     pattern: /[0-9]*\.[0-9]+/},
    {type: "INTEGER[%]",   pattern: /[0-9]+/},
    {type: "VARIABLE[%]",  pattern: /[_a-zA-Z][_0-9a-zA-Z]*/},

    {type: "OPERATOR_BRO[%]", pattern: /\[/},
    {type: "OPERATOR_BRC[%]", pattern: /\]/},
    {type: "OPERATOR_PRO[%]", pattern: /\(/},
    {type: "OPERATOR_PRC[%]", pattern: /\)/},

    {type: "OPERATOR_NEG", pattern: /-/,
        after: ['START',        'OPERATOR_SUM',    'OPERATOR_DIV',    //    +  /
                'OPERATOR_MUL', 'OPERATOR_MOD',    'OPERATOR_SET',    // *  %  :=
                'OPERATOR_LST', 'OPERATOR_BRO[%]', 'OPERATOR_PRO[%]', // ,  (  [
                'OPERATOR_LTE', 'OPERATOR_GTE',    'OPERATOR_NE',     // <= >= <>
                'OPERATOR_LT',  'OPERATOR_GT',     'OPERATOR_EQ']},   // <  >  =
    {type: "OPERATOR_SUB", pattern: /-/},
    {type: "OPERATOR_SUM", pattern: /\+/},
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
    {pattern: /BOOL\[(\d+)\]/, operator: "bool", parameters: [1]},
    {pattern: /FLOAT\[(\d+)\]/, operator: "float", parameters: [1]},
    {pattern: /INTEGER\[(\d+)\]/, operator: "int", parameters: [1]},
    {pattern: /CHAR\[(\d+)\]/, operator: "char", parameters: [1]},
    {pattern: /VARIABLE\[(.*?)\]/, operator: "var", parameters: [1]},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_PRO\[(\d+)\](.+?)OPERATOR_PRC\[\2\]/, operator: "func", parameters: [1, 3]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_PRO\[(\d+)\]OPERATOR_PRC\[\2\]/, operator: "func", parameters: [1]},
    {pattern: /OPERATOR_PRO\[(\d+)\](.+?)OPERATOR_PRC\[\1\]/, operator: "parens", parameters: [2]},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BRO\[(\d+)\]EXPRESSION\[(\d+)\]OPERATOR_BRC\[\2\]/, operator: "array_index", parameters: [1, 3]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_BRO\[(\d+)\]OPERATOR_BRC\[\2\]/, operator: "array_push", parameters: [1]},
    {pattern: /OPERATOR_BRO\[(\d+)\]EXPRESSION\[(\d+)\]OPERATOR_BRC\[\1\]/, operator: "array", parameters: [2]},
    {pattern: /OPERATOR_BRO\[(\d+)\]OPERATOR_BRC\[\1\]/, operator: "empty_array", parameters: []},

    {pattern: /OPERATOR_NEGEXPRESSION\[(\d+)\]/,                    operator: "neg", parameters: [1]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_MULEXPRESSION\[(\d+)\]/, operator: "mul", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_DIVEXPRESSION\[(\d+)\]/, operator: "div", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_MODEXPRESSION\[(\d+)\]/, operator: "mod", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUMEXPRESSION\[(\d+)\]/, operator: "sum", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SUBEXPRESSION\[(\d+)\]/, operator: "sub", parameters: [1, 2]},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_GTEXPRESSION\[(\d+)\]/,  operator: "gt",  parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_GTEEXPRESSION\[(\d+)\]/, operator: "gte", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LTEXPRESSION\[(\d+)\]/,  operator: "lt",  parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LTEEXPRESSION\[(\d+)\]/, operator: "lte", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_EQEXPRESSION\[(\d+)\]/,  operator: "eq",  parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_NEEXPRESSION\[(\d+)\]/,  operator: "ne",  parameters: [1, 2]},

    {pattern: /OPERATOR_NOTEXPRESSION\[(\d+)\]/,                    operator: "not", parameters: [1]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_ANDEXPRESSION\[(\d+)\]/, operator: "and", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_OREXPRESSION\[(\d+)\]/,  operator: "or",  parameters: [1, 2]},

    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_SETEXPRESSION\[(\d+)\]/, operator: "set", parameters: [1, 2]},
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_LSTEXPRESSION\[(\d+)\]/, operator: "list", parameters: [1, 2]}
];

function Parser(code) {
    this.raw_code = code;
    this.tokenized_code = "";
    this.expression_counter = 0;
    this.expressions = {};
    this.constants_counter = 0;
    this.constants = {};
    this.variables = {};
    this.parens_counter = 0;
    this.bracket_counter = 0;

    this.tokenize(this.raw_code, "START");
    this.parse(this.tokenized_code);
}

Parser.prototype.tokenize = function(code, last_token_type) {
    for (var i = 0; i < token_patterns.length; i++) {
        var result = token_patterns[i].pattern.exec(code);
        // There is a match, its the next character, no after requirement, or last token in after
        if (result && result.index === 0 && (!token_patterns[i].after || token_patterns[i].after.indexOf(last_token_type) != -1)) {
            var token, value;
            if (token_patterns[i].type == "BOOL[%]") {
                this.constants[this.constants_counter] = result[0] === "I";
                value = this.constants_counter++;
            } else if (token_patterns[i].type == "FLOAT[%]") {
                this.constants[this.constants_counter] = parseFloat(result[0]);
                value = this.constants_counter++;
            } else if (token_patterns[i].type == "INTEGER[%]") {
                this.constants[this.constants_counter] = parseInt(result[0]);
                value = this.constants_counter++;
            } else if (token_patterns[i].type == "CHAR[%]") {
                this.constants[this.constants_counter] = result[0].replace(/(^'|'$)/g, "").replace(/^\\/, "");
                value = this.constants_counter++;
            } else if (token_patterns[i].type == "OPERATOR_PRO[%]") {
                value = this.parens_counter++;
            } else if (token_patterns[i].type == "OPERATOR_PRC[%]") {
                value = --this.parens_counter;
            } else if (token_patterns[i].type == "OPERATOR_BRO[%]") {
                value = this.bracket_counter++;
            } else if (token_patterns[i].type == "OPERATOR_BRC[%]") {
                value = --this.bracket_counter;
            } else {
                value = result[0];
            }
            token = token_patterns[i].type.replace("%", value);
            this.tokenized_code += token;
            return this.tokenize(code.replace(token_patterns[i].pattern, ""), token_patterns[i].type || last_token_type);
        }
    }
};

Parser.prototype.parse = function(code) {
    var expression, expression_num;
    for (var i = 0; i < expression_patterns.length; i++) {
        var result = expression_patterns[i].pattern.exec(code);
        if (result) {
            var params = expression_patterns[i].parameters.map(function(param_key) {
                return result[param_key];
            });
            if (expression_patterns[i].operator == "func") {
                if (params.length > 1) {
                    expression = this.parse(params[1]);
                    expression.id = this.expression_counter++;
                    this.expressions[expression.id] = expression;
                    params[1] = expression.id;
                }
                expression = new Expression(this.expression_counter++, expression_patterns[i].operator, params);
            } else if (expression_patterns[i].operator == "parens") {
                expression = this.parse(params[0]);
                expression.id = this.expression_counter++;
            } else {
                expression = new Expression(this.expression_counter++, expression_patterns[i].operator, params);
            }
            this.expressions[expression.id] = expression;
            return this.parse(code.replace(result[0], "EXPRESSION[" + expression.id + "]"));
        }
    }
    var match = code.match(/^EXPRESSION\[(\d+)\]$/);
    if (!match) {
        throw "Compile Error: unresolved tokens '" + code.replace(/EXPRESSION\[\d+\]/g, ";").replace(/(^;|;$)/g, "").split(";") + "'";
    } else {
        return this.expressions[match[1]];
    }
    return new Expression(null, "expression", [this.expression_counter - 1]);
};

Parser.prototype.evaluate = function(context) {
    return this.expressions[this.expression_counter - 1].evaluate(context, this.expressions, this.constants);
};

function Expression(id, operator, params) {
    this.id = id;
    this.operator = operator;
    this.params = params;
}

Expression.prototype.evaluate = function(context, expressions, constants) {
    var a, b, c, array_index_expression, keys, value, func;
    if (this.operator == "expression") {
        return expressions[this.params[0]].evaluate(context, expressions, constants);
    } else if (this.operator == "bool") {
        return constants[this.params[0]];
    } else if (this.operator == "float") {
        return constants[this.params[0]];
    } else if (this.operator == "int") {
        return constants[this.params[0]];
    } else if (this.operator == "char") {
        return constants[this.params[0]];
    } else if (this.operator == "sum") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a + b;
        if (a.constructor === Array && b.constructor === Array) return a.concat(b);
        else throw "Compile Error: + operator requires number or array operands";
    } else if (this.operator == "sub") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a - b;
        else throw "Compile Error: - operator requires number operands";
    } else if (this.operator == "mul") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a * b;
        else throw "Compile Error: * operator requires number operands";
    } else if (this.operator == "div") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a / b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: / operator requires number operands";
    } else if (this.operator == "mod") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number")
            if (b !== 0) return a % b;
            else throw "Compile Error: division by zero";
        else throw "Compile Error: % operator requires number operands";
    } else if (this.operator == "gt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a > b;
        else throw "Compile Error: > operator requires number operands";
    } else if (this.operator == "gte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a >= b;
        else throw "Compile Error: >= operator requires number operands";
    } else if (this.operator == "lt") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a < b;
        else throw "Compile Error: < operator requires number operands";
    } else if (this.operator == "lte") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "number" && typeof b === "number") return a <= b;
        else throw "Compile Error: <= operator requires number operands";
    } else if (this.operator == "eq") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === typeof b) return a == b;
        else throw "Compile Error: = operator requires operands of the same type";
    } else if (this.operator == "ne") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === typeof b) return a != b;
        else throw "Compile Error: <> operator requires operands of the same type";
    } else if (this.operator == "and") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "boolean" && typeof b === "boolean") return a && b;
        else throw "Compile Error: & operator requires boolean operands";
    } else if (this.operator == "or") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        b = expressions[this.params[1]].evaluate(context, expressions, constants);
        if (typeof a === "boolean" && typeof b === "boolean") return a || b;
        else throw "Compile Error: | operator requires boolean operands";
    } else if (this.operator == "neg") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (typeof a === "number") return -1 * a;
        else throw "Compile Error: - operator requires number operand";
    } else if (this.operator == "not") {
        a = expressions[this.params[0]].evaluate(context, expressions, constants);
        if (typeof a === "boolean") return !a;
        else throw "Compile Error: ! operator requires boolean operand";
    } else if (this.operator == "var") {
        return context.getVariable(this.params[0]);
    } else if (this.operator == "func") {
        if (expressions[this.params[0]].operator == "var") {
            if (this.params.length == 1) {
                return context.applyFunction(expressions[this.params[0]].params[0]);
            } else {
                value = this.evaluateList(expressions[this.params[1]], context, expressions, constants);
                return context.applyFunction(expressions[this.params[0]].params[0], value);
            }
        }
        throw "Syntax Error: left operand is not a valid function name";
    } else if (this.operator == "array") {
        return this.evaluateList(expressions[this.params[0]], context, expressions, constants);
    } else if (this.operator == "empty_array") {
        return [];
    } else if (this.operator == "list") {
        return this.evaluateList(this, context, expressions, constants);
    } else if (this.operator == "array_index") {
        keys = this.evaluateArrayIndex(this, context, expressions, constants);
        return context.getArrayValue(keys);
    } else if (this.operator == "set") {
        if (expressions[this.params[0]].operator == "var") {
            a = expressions[this.params[0]].params[0];
            b = expressions[this.params[1]].evaluate(context, expressions, constants);
            return context.setVariable(a, b);
        } else if (expressions[this.params[0]].operator == "array_push") {
            value = expressions[this.params[1]].evaluate(context, expressions, constants);
            array_index_expression = expressions[this.params[0]];
            if (expressions[array_index_expression.params[0]].operator == "var") {
                a = expressions[array_index_expression.params[0]].params[0];
                return context.getVariable(a).push(value);
            } else if (expressions[array_index_expression.params[0]].operator == "array_index") {
                keys = this.evaluateArrayIndex(expressions[array_index_expression.params[0]], context, expressions, constants);
                return context.getArrayValue(keys).push(value);
            }
        } else if (expressions[this.params[0]].operator == "array_index") {
            value = expressions[this.params[1]].evaluate(context, expressions, constants);
            keys = this.evaluateArrayIndex(expressions[this.params[0]], context, expressions, constants);
            return context.setArrayValue(keys, value);
        }
        throw "Syntax Error: left operand is not a valid variable or array syntax";
    }
    throw "Syntax Error: cannot use " + this.operator + " operator here";
};

Expression.prototype.evaluateList = function(list, context, expressions, constants) {
    var sublist, flatlist = [];
    if (list.operator == "list") {
        sublist = this.evaluateList(expressions[list.params[0]], context, expressions, constants);
        sublist.forEach(function(item) { flatlist.push(item); });
        sublist = this.evaluateList(expressions[list.params[1]], context, expressions, constants);
        sublist.forEach(function(item) { flatlist.push(item); });
    } else {
        flatlist.push(list.evaluate(context, expressions, constants));
    }
    return flatlist;
};

Expression.prototype.evaluateArrayIndex = function(expression, context, expressions, constants) {
    var keys;
    if (expressions[expression.params[0]].operator == "var") {
        keys = [expressions[expression.params[0]].params[0]];
    } else if (expressions[expression.params[0]].operator == "array_index"){
        keys = this.evaluateArrayIndex(expressions[expression.params[0]], context, expressions, constants);
    } else throw "Syntax Error: bad array syntax";
    keys.push(expressions[expression.params[1]].evaluate(context, expressions, constants));
    return keys;
};

    return Parser;
});
