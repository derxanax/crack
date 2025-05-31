#!/usr/bin/env node
declare enum TokenType {
    KEYWORD = "KEYWORD",
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",
    OPERATOR = "OPERATOR",
    COMPARISON = "COMPARISON",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
    NEWLINE = "NEWLINE",
    EOF = "EOF"
}
interface Token {
    type: TokenType;
    value: string;
    line: number;
}
interface ASTNode {
    type: string;
    [key: string]: any;
}
declare class SimpleCrackInterpreter {
    private variables;
    showLogo(): void;
    tokenize(code: string): Token[];
    parse(tokens: Token[]): ASTNode[];
    parseStatement(tokens: Token[], start: number): {
        node: ASTNode | null;
        newPosition: number;
    };
    parseIfStatement(tokens: Token[], start: number): {
        node: ASTNode | null;
        newPosition: number;
    };
    parseWhileStatement(tokens: Token[], start: number): {
        node: ASTNode | null;
        newPosition: number;
    };
    parseConditionString(condStr: string): any;
    execute(ast: ASTNode[]): void;
    executeNode(node: ASTNode): void;
    evaluateCondition(condition: any): boolean;
    resolveValue(value: string): any;
    evaluateExpression(expr: string): number;
    run(filename: string): void;
}
export { SimpleCrackInterpreter };
//# sourceMappingURL=crack_simple.d.ts.map