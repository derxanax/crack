#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCrackInterpreter = void 0;
const fs = __importStar(require("fs"));
var TokenType;
(function (TokenType) {
    TokenType["KEYWORD"] = "KEYWORD";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING"] = "STRING";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["OPERATOR"] = "OPERATOR";
    TokenType["COMPARISON"] = "COMPARISON";
    TokenType["INDENT"] = "INDENT";
    TokenType["DEDENT"] = "DEDENT";
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
const KEYWORDS = ['conlog', 'if', 'else', 'while', 'for'];
const OPERATORS = ['+', '-', '*', '/', '='];
const COMPARISON_OPERATORS = ['==', '!=', '>=', '<=', '>', '<'];
class SimpleCrackInterpreter {
    constructor() {
        this.variables = new Map();
    }
    showLogo() {
        console.log(`
 ██████╗██████╗  █████╗  ██████╗██╗  ██╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
██║     ██████╔╝███████║██║     █████╔╝ 
██║     ██╔══██╗██╔══██║██║     ██╔═██╗ 
╚██████╗██║  ██║██║  ██║╚██████╗██║  ██╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
    v2.0.0 - ПРОСТОЙ СИНТАКСИС! 💻
`);
    }
    tokenize(code) {
        const tokens = [];
        const lines = code.split('\n');
        const indentStack = [0];
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const lineNumber = lineIndex + 1;
            if (line.trim() === '')
                continue;
            let indentLevel = 0;
            for (let i = 0; i < line.length; i++) {
                if (line[i] === ' ') {
                    indentLevel++;
                }
                else {
                    break;
                }
            }
            const currentIndent = indentStack[indentStack.length - 1];
            if (indentLevel > currentIndent) {
                indentStack.push(indentLevel);
                tokens.push({ type: TokenType.INDENT, value: '', line: lineNumber });
            }
            else if (indentLevel < currentIndent) {
                while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indentLevel) {
                    indentStack.pop();
                    tokens.push({ type: TokenType.DEDENT, value: '', line: lineNumber });
                }
            }
            const trimmedLine = line.trim();
            let current = 0;
            while (current < trimmedLine.length) {
                let char = trimmedLine[current];
                if (/\s/.test(char)) {
                    current++;
                    continue;
                }
                if (char === '"') {
                    let value = '';
                    current++;
                    while (current < trimmedLine.length && trimmedLine[current] !== '"') {
                        value += trimmedLine[current];
                        current++;
                    }
                    current++;
                    tokens.push({ type: TokenType.STRING, value, line: lineNumber });
                    continue;
                }
                if (/\d/.test(char)) {
                    let value = '';
                    while (current < trimmedLine.length && /\d/.test(trimmedLine[current])) {
                        value += trimmedLine[current];
                        current++;
                    }
                    tokens.push({ type: TokenType.NUMBER, value, line: lineNumber });
                    continue;
                }
                let comparisonOp = '';
                for (const op of COMPARISON_OPERATORS) {
                    if (trimmedLine.substr(current, op.length) === op) {
                        comparisonOp = op;
                        break;
                    }
                }
                if (comparisonOp) {
                    tokens.push({ type: TokenType.COMPARISON, value: comparisonOp, line: lineNumber });
                    current += comparisonOp.length;
                    continue;
                }
                if (OPERATORS.includes(char)) {
                    tokens.push({ type: TokenType.OPERATOR, value: char, line: lineNumber });
                    current++;
                    continue;
                }
                if (/[a-zA-Z]/.test(char)) {
                    let value = '';
                    while (current < trimmedLine.length && /[a-zA-Z0-9_]/.test(trimmedLine[current])) {
                        value += trimmedLine[current];
                        current++;
                    }
                    const type = KEYWORDS.includes(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
                    tokens.push({ type, value, line: lineNumber });
                    continue;
                }
                current++;
            }
            tokens.push({ type: TokenType.NEWLINE, value: '', line: lineNumber });
        }
        while (indentStack.length > 1) {
            indentStack.pop();
            tokens.push({ type: TokenType.DEDENT, value: '', line: lines.length });
        }
        tokens.push({ type: TokenType.EOF, value: '', line: lines.length });
        return tokens;
    }
    parse(tokens) {
        const ast = [];
        let current = 0;
        while (current < tokens.length && tokens[current].type !== TokenType.EOF) {
            const result = this.parseStatement(tokens, current);
            if (result.node) {
                ast.push(result.node);
            }
            current = result.newPosition;
        }
        return ast;
    }
    parseStatement(tokens, start) {
        let current = start;
        while (current < tokens.length &&
            (tokens[current].type === TokenType.NEWLINE || tokens[current].type === TokenType.DEDENT)) {
            current++;
        }
        if (current >= tokens.length) {
            return { node: null, newPosition: current };
        }
        const token = tokens[current];
        if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
            current++;
            const nextToken = tokens[current];
            if (nextToken && nextToken.type === TokenType.STRING) {
                current++;
                return {
                    node: {
                        type: 'FunctionCall',
                        name: 'conlog',
                        args: [{ type: 'String', value: nextToken.value }]
                    },
                    newPosition: current
                };
            }
            else if (nextToken && nextToken.type === TokenType.IDENTIFIER) {
                current++;
                return {
                    node: {
                        type: 'FunctionCall',
                        name: 'conlog',
                        args: [{ type: 'Variable', name: nextToken.value }]
                    },
                    newPosition: current
                };
            }
        }
        if (token.type === TokenType.IDENTIFIER) {
            const nextToken = tokens[current + 1];
            if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
                const varName = token.value;
                current += 2;
                let expression = '';
                while (current < tokens.length &&
                    tokens[current].type !== TokenType.NEWLINE &&
                    tokens[current].type !== TokenType.EOF) {
                    expression += tokens[current].value + ' ';
                    current++;
                }
                return {
                    node: {
                        type: 'VariableAssignment',
                        name: varName,
                        value: { type: 'Expression', expression: expression.trim() }
                    },
                    newPosition: current
                };
            }
        }
        if (token.type === TokenType.KEYWORD && token.value === 'if') {
            return this.parseIfStatement(tokens, current);
        }
        if (token.type === TokenType.KEYWORD && token.value === 'while') {
            return this.parseWhileStatement(tokens, current);
        }
        current++;
        return { node: null, newPosition: current };
    }
    parseIfStatement(tokens, start) {
        let current = start + 1;
        let condition = '';
        while (current < tokens.length && tokens[current].type !== TokenType.NEWLINE) {
            condition += tokens[current].value + ' ';
            current++;
        }
        current++;
        if (tokens[current] && tokens[current].type === TokenType.INDENT) {
            current++;
            const body = [];
            while (current < tokens.length && tokens[current].type !== TokenType.DEDENT && tokens[current].type !== TokenType.EOF) {
                const result = this.parseStatement(tokens, current);
                if (result.node) {
                    body.push(result.node);
                }
                current = result.newPosition;
            }
            if (tokens[current] && tokens[current].type === TokenType.DEDENT) {
                current++;
            }
            return {
                node: {
                    type: 'IfStatement',
                    condition: this.parseConditionString(condition.trim()),
                    body: body
                },
                newPosition: current
            };
        }
        return { node: null, newPosition: current };
    }
    parseWhileStatement(tokens, start) {
        let current = start + 1;
        let condition = '';
        while (current < tokens.length && tokens[current].type !== TokenType.NEWLINE) {
            condition += tokens[current].value + ' ';
            current++;
        }
        current++;
        if (tokens[current] && tokens[current].type === TokenType.INDENT) {
            current++;
            const body = [];
            while (current < tokens.length && tokens[current].type !== TokenType.DEDENT && tokens[current].type !== TokenType.EOF) {
                const result = this.parseStatement(tokens, current);
                if (result.node) {
                    body.push(result.node);
                }
                current = result.newPosition;
            }
            if (tokens[current] && tokens[current].type === TokenType.DEDENT) {
                current++;
            }
            return {
                node: {
                    type: 'WhileStatement',
                    condition: this.parseConditionString(condition.trim()),
                    body: body
                },
                newPosition: current
            };
        }
        return { node: null, newPosition: current };
    }
    parseConditionString(condStr) {
        for (const op of COMPARISON_OPERATORS) {
            if (condStr.includes(op)) {
                const parts = condStr.split(op);
                return {
                    left: parts[0].trim(),
                    operator: op,
                    right: parts[1].trim()
                };
            }
        }
        return { left: condStr, operator: '==', right: 'true' };
    }
    execute(ast) {
        for (const node of ast) {
            this.executeNode(node);
        }
    }
    executeNode(node) {
        switch (node.type) {
            case 'FunctionCall':
                if (node.name === 'conlog') {
                    if (node.args[0].type === 'String') {
                        console.log(node.args[0].value);
                    }
                    else if (node.args[0].type === 'Variable') {
                        const value = this.variables.get(node.args[0].name);
                        console.log(value !== undefined ? value : 'undefined');
                    }
                }
                break;
            case 'VariableAssignment':
                if (node.value.type === 'Expression') {
                    const result = this.evaluateExpression(node.value.expression);
                    this.variables.set(node.name, result);
                }
                break;
            case 'IfStatement':
                const conditionResult = this.evaluateCondition(node.condition);
                if (conditionResult) {
                    this.execute(node.body);
                }
                break;
            case 'WhileStatement':
                while (this.evaluateCondition(node.condition)) {
                    this.execute(node.body);
                }
                break;
        }
    }
    evaluateCondition(condition) {
        const left = this.resolveValue(condition.left);
        const right = this.resolveValue(condition.right);
        switch (condition.operator) {
            case '==': return left == right;
            case '!=': return left != right;
            case '>': return left > right;
            case '<': return left < right;
            case '>=': return left >= right;
            case '<=': return left <= right;
            default: return false;
        }
    }
    resolveValue(value) {
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (!isNaN(Number(value)))
            return Number(value);
        if (this.variables.has(value))
            return this.variables.get(value);
        return value;
    }
    evaluateExpression(expr) {
        try {
            let processedExpr = expr;
            this.variables.forEach((varValue, varName) => {
                const regex = new RegExp(`\\b${varName}\\b`, 'g');
                processedExpr = processedExpr.replace(regex, String(varValue));
            });
            const cleanExpr = processedExpr.replace(/[^0-9+\-*/.() ]/g, '');
            return eval(cleanExpr);
        }
        catch {
            return 0;
        }
    }
    run(filename) {
        try {
            const code = fs.readFileSync(filename, 'utf-8');
            const tokens = this.tokenize(code);
            const ast = this.parse(tokens);
            this.execute(ast);
        }
        catch (error) {
            console.log('❌ Ошибка:', error);
        }
    }
}
exports.SimpleCrackInterpreter = SimpleCrackInterpreter;
function main() {
    const interpreter = new SimpleCrackInterpreter();
    if (process.argv.length < 3) {
        interpreter.showLogo();
        console.log('Использование: node crack_simple.js <file.crack>');
        return;
    }
    const filename = process.argv[2];
    interpreter.run(filename);
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=crack_simple.js.map