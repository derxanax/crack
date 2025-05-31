#!/usr/bin/env node
declare enum TokenType {
    IDENTIFIER = "IDENTIFIER",
    STRING = "STRING",
    NUMBER = "NUMBER",
    OPERATOR = "OPERATOR",
    KEYWORD = "KEYWORD",
    PARENTHESIS = "PARENTHESIS",
    BRACE = "BRACE",
    COMPARISON = "COMPARISON",
    LOGICAL = "LOGICAL",
    INDENT = "INDENT",
    DEDENT = "DEDENT",
    NEWLINE = "NEWLINE",
    UNKNOWN = "UNKNOWN",
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
declare class CrackInterpreter {
    private variables;
    private modules;
    private currentFilename;
    showLogo(): void;
    tokenize(code: string): Token[];
    parse(tokens: Token[]): Promise<ASTNode[]>;
    parseIfStatement(tokens: Token[], start: number): Promise<{
        node: ASTNode | null;
        newPosition: number;
    }>;
    parseWhileStatement(tokens: Token[], start: number): Promise<{
        node: ASTNode | null;
        newPosition: number;
    }>;
    parseForStatement(tokens: Token[], start: number): Promise<{
        node: ASTNode | null;
        newPosition: number;
    }>;
    parseCondition(tokens: Token[], start: number): Promise<{
        condition: any;
        newPosition: number;
    }>;
    parseIndentedBlock(tokens: Token[], start: number): Promise<{
        body: ASTNode[];
        newPosition: number;
    }>;
    parseBlock(tokens: Token[], start: number): Promise<{
        body: ASTNode[];
        newPosition: number;
    }>;
    execute(ast: ASTNode[]): Promise<void>;
    evaluateCondition(condition: any): boolean;
    resolveValue(value: string): any;
    evaluateExpression(expr: string): number;
    loadModule(moduleName: string): void;
    run(filename: string): Promise<void>;
}
declare function main(): Promise<void>;
export { CrackInterpreter, main };
//# sourceMappingURL=main.d.ts.map