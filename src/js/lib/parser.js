define(['lib/expression'], function(Expression) {

function Parser(code) {
    if (this.parser_cache[code]) {
        return this.parser_cache[code];
    }
    this.raw_code = code;
    this.tokenized_code = "";
    this.expression_counter = 0;
    this.expressions = {};
    this.constants_counter = 0;
    this.constants = {};
    this.variables = {};
    this.parens_counter = 0;
    this.bracket_counter = 0;

    this.string_parser = false;

    this.tokenize(this.raw_code, "START");
    this.parse(this.tokenized_code);

    this.parser_cache[code] = this;
}

Parser.prototype.parser_cache = {};

Parser.prototype.token_patterns = [
    {type: "",             pattern: /\s+/},
    {type: "BOOL[%]",      pattern: /(I|H)/},
    {type: "FLOAT[%]",     pattern: /[0-9]*\.[0-9]+/},
    {type: "STRING[%]",    pattern: /"/},
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
                'OPERATOR_LT',  'OPERATOR_GT',     'OPERATOR_EQ',     // <  >  =
                'OPERATOR_RNG']},                                     // ..
    {type: "OPERATOR_SUB", pattern: /-/},
    {type: "OPERATOR_SUM", pattern: /\+/},
    {type: "OPERATOR_DIV", pattern: /\//},
    {type: "OPERATOR_MUL", pattern: /\*/},
    {type: "OPERATOR_MOD", pattern: /%/},
    {type: "OPERATOR_RNG", pattern: /\.\./},

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

Parser.prototype.expression_patterns = [
    {pattern: /BOOL\[(\d+)\]/, operator: "bool", parameters: [1]},
    {pattern: /FLOAT\[(\d+)\]/, operator: "float", parameters: [1]},
    {pattern: /STRING\[(\d+)\]/, operator: "string", parameters: [1]},
    {pattern: /INTEGER\[(\d+)\]/, operator: "int", parameters: [1]},
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
    {pattern: /EXPRESSION\[(\d+)\]OPERATOR_RNGEXPRESSION\[(\d+)\]/, operator: "rng", parameters: [1, 2]},

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

Parser.prototype.stringParser = function(code, escaped) {
    var head = code[0],
        tail = code.slice(1);
    if (head === "\\") {
        return head + this.stringParser(tail, true);
    } else if (!escaped && head === "\"") {
        return "";
    } else {
        return head + this.stringParser(tail);
    }
};

Parser.prototype.tokenize = function(code, last_token_type) {
    for (var i = 0; i < this.token_patterns.length; i++) {
        var token_pattern = this.token_patterns[i],
            result = token_pattern.pattern.exec(code);
        // There is a match, its the next character, no after requirement, or last token in after
        if (result && result.index === 0 && (!token_pattern.after || token_pattern.after.indexOf(last_token_type) != -1)) {
            var token, value;
            if (token_pattern.type == "STRING[%]") {
                var string_parser_result = this.stringParser(code.replace(token_pattern.pattern, ""));
                result[0] = "\"" + string_parser_result + "\"";
                this.constants[this.constants_counter] = string_parser_result.replace(/\\("|\\)/g, "$1");
                value = this.constants_counter++;
            } else if (token_pattern.type == "BOOL[%]") {
                this.constants[this.constants_counter] = result[0] === "I";
                value = this.constants_counter++;
            } else if (token_pattern.type == "FLOAT[%]") {
                this.constants[this.constants_counter] = parseFloat(result[0]);
                value = this.constants_counter++;
            } else if (token_pattern.type == "INTEGER[%]") {
                this.constants[this.constants_counter] = parseInt(result[0]);
                value = this.constants_counter++;
            } else if (token_pattern.type == "OPERATOR_PRO[%]") {
                value = this.parens_counter++;
            } else if (token_pattern.type == "OPERATOR_PRC[%]") {
                value = --this.parens_counter;
            } else if (token_pattern.type == "OPERATOR_BRO[%]") {
                value = this.bracket_counter++;
            } else if (token_pattern.type == "OPERATOR_BRC[%]") {
                value = --this.bracket_counter;
            } else {
                value = result[0];
            }
            token = token_pattern.type.replace("%", value);
            this.tokenized_code += token;
            return this.tokenize(code.replace(result[0], ""), token_pattern.type || last_token_type);
        }
    }
};

Parser.prototype.parseExpression = function (code, expression_pattern) {
    var expression;
    var result = expression_pattern.pattern.exec(code);
    if (result) {
        var params = expression_pattern.parameters.map(function(param_key) {
            return result[param_key];
        });
        if (expression_pattern.operator == "func") {
            if (params.length > 1) {
                expression = this.parse(params[1]);
                expression.id = this.expression_counter++;
                this.expressions[expression.id] = expression;
                params[1] = expression.id;
            }
            expression = new Expression(this.expression_counter++, expression_pattern.operator, params);
        } else if (expression_pattern.operator == "parens") {
            expression = this.parse(params[0]);
            expression.id = this.expression_counter++;
        } else {
            expression = new Expression(this.expression_counter++, expression_pattern.operator, params);
        }
        this.expressions[expression.id] = expression;
        return code.replace(result[0], "EXPRESSION[" + expression.id + "]");
    }
    return null;
};

Parser.prototype.parse = function(code) {
    for (var i = 0; i < this.expression_patterns.length; i++) {
        var updated_code = this.parseExpression(code, this.expression_patterns[i]);
        if (updated_code !== null) return this.parse(updated_code);
    }
    var match = code.match(/^EXPRESSION\[(\d+)\]$/);
    if (!match) {
        if (code === "") {
            throw "Compile Error: no code to parse";
        } else {
            var unresolved_tokens = code.replace(/EXPRESSION\[\d+\]/g, ";").replace(/(^;|;$)/g, "").split(";");
            if (unresolved_tokens[0] === '') throw "Compile Error: missing operator";
            else throw "Compile Error: unresolved tokens '" + unresolved_tokens + "'";
        }
    } else {
        return this.expressions[match[1]];
    }
    return new Expression(null, "expression", [this.expression_counter - 1]);
};

Parser.prototype.evaluate = function(context) {
    return this.expressions[this.expression_counter - 1].evaluate(context, this.expressions, this.constants);
};

    return Parser;
});
