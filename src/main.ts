#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as readline from 'readline';
import { execSync } from 'child_process';

enum TokenType {
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING', 
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  KEYWORD = 'KEYWORD',
  PARENTHESIS = 'PARENTHESIS',
  BRACE = 'BRACE',
  COMPARISON = 'COMPARISON',
  LOGICAL = 'LOGICAL',
  DOT = 'DOT',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  NEWLINE = 'NEWLINE',
  BLOCK_START = 'BLOCK_START',
  BLOCK_END = 'BLOCK_END',
  UNKNOWN = 'UNKNOWN',
  EOF = 'EOF'
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



class ErrorHandler {
  static showCriticalError(message: string, line: number, suggestion: string): void {
    console.log(`🚨 Ошибка (строка ${line}): ${message}`);
    console.log(`💡 ${suggestion}`);
    process.exit(1);
  }

  static showWarning(message: string, line: number, token: string): void {
    console.log(`⚠️  ПРЕДУПРЕЖДЕНИЕ (строка ${line}): ${message} '${token}'`);
  }

  static throwError(message: string, line: number): void {
    throw new Error(`Строка ${line}: ${message}`);
  }
}

const KEYWORDS = ['conlog', 'imp', 'codego', 'if', 'else', 'while', 'for'];
const OPERATORS = ['+', '-', '*', '/', '=', '?', ';', ':'];
const COMPARISON_OPERATORS = ['==', '!=', '>=', '<=', '>', '<'];
const LOGICAL_OPERATORS = ['&&', '||', '!'];

class CrackInterpreter {
  private variables: Map<string, any> = new Map();
  private modules: Map<string, any> = new Map();
  private currentFilename: string = '';

  showLogo(): void {
    console.log(`
 ██████╗██████╗  █████╗  ██████╗██╗  ██╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
██║     ██████╔╝███████║██║     █████╔╝ 
██║     ██╔══██╗██╔══██║██║     ██╔═██╗ 
╚██████╗██║  ██║██║  ██║╚██████╗██║  ██╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
    v1.0.0 - Ready to crack code! 💻
`);
  }

  tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const lines = code.split('\n');
    const indentStack: number[] = [0];
    let lineNumber = 1;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      lineNumber = lineIndex + 1;
      
      if (line.trim() === '') {
        // Добавляем NEWLINE токен для пустых строк
        tokens.push({ type: TokenType.NEWLINE, value: '', line: lineNumber });
        continue;
      }
      
      let indentLevel = 0;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ') {
          indentLevel++;
        } else {
          break;
        }
      }
      
      const currentIndent = indentStack[indentStack.length - 1];
      
      if (indentLevel > currentIndent) {
        indentStack.push(indentLevel);
        tokens.push({ type: TokenType.INDENT, value: '', line: lineNumber });
      } else if (indentLevel < currentIndent) {
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
          let startLine = lineNumber;
          while (current < trimmedLine.length && trimmedLine[current] !== '"') {
            value += trimmedLine[current];
          current++;
        }
          
          if (current >= trimmedLine.length) {
            ErrorHandler.throwError('Незакрытая строка - добавьте закрывающую кавычку "', startLine);
          } else {
        current++;
            tokens.push({ type: TokenType.STRING, value, line: lineNumber });
          }
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

      if (char === '(' || char === ')') {
        tokens.push({ type: TokenType.PARENTHESIS, value: char, line: lineNumber });
        current++;
        continue;
      }

      if (char === '{' || char === '}') {
        tokens.push({ type: TokenType.BRACE, value: char, line: lineNumber });
        current++;
        continue;
      }

      // Check for comparison operators (must be before single operators)
      let comparisonOp = '';
      for (const op of COMPARISON_OPERATORS) {
        if (trimmedLine.substring(current, current + op.length) === op) {
          comparisonOp = op;
          break;
        }
      }
      if (comparisonOp) {
        tokens.push({ type: TokenType.COMPARISON, value: comparisonOp, line: lineNumber });
        current += comparisonOp.length;
        continue;
      }

      // Проверка блочных маркеров (ДОЛЖНА БЫТЬ ДО логических операторов!)
      if (char === '*' && trimmedLine.substring(current, current + 3) === '**!') {
        tokens.push({ type: TokenType.BLOCK_START, value: '**!', line: lineNumber });
        current += 3;
        continue;
      }

      if (char === '!' && trimmedLine.substring(current, current + 3) === '!**') {
        tokens.push({ type: TokenType.BLOCK_END, value: '!**', line: lineNumber });
        current += 3;
        continue;
      }

      // Check for logical operators
      let logicalOp = '';
      for (const op of LOGICAL_OPERATORS) {
        if (trimmedLine.substring(current, current + op.length) === op) {
          logicalOp = op;
          break;
        }
      }
      if (logicalOp) {
        tokens.push({ type: TokenType.LOGICAL, value: logicalOp, line: lineNumber });
        current += logicalOp.length;
        continue;
      }

      if (char === '.') {
        tokens.push({ type: TokenType.DOT, value: char, line: lineNumber });
        current++;
        continue;
      }

      // Комментарии ## (ДОЛЖНЫ БЫТЬ ДО OPERATORS!)
      if (char === '#' && trimmedLine[current + 1] === '#') {
        // Пропускаем всю строку до конца как комментарий
        break; // выходим из цикла обработки символов в строке
      }

      if (OPERATORS.includes(char)) {
        tokens.push({ type: TokenType.OPERATOR, value: char, line: lineNumber });
        current++;
        continue;
      }

      if (char === '/' && trimmedLine[current + 1] === '/') {
        let value = '';
        current += 2;
        while (current < trimmedLine.length && !(trimmedLine[current] === '/' && trimmedLine[current + 1] === '/')) {
          value += trimmedLine[current];
          current++;
        }
        current += 2;
        tokens.push({ type: TokenType.STRING, value: value.trim(), line: lineNumber });
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

      // Пропускаем Unicode символы (русские буквы, эмодзи и т.д.)
      if (/\p{L}/u.test(char) || /\p{M}/u.test(char) || /\p{S}/u.test(char)) {
        current++; // просто пропускаем без создания токена
        continue;
      }

      ErrorHandler.throwError(`Неизвестный символ '${char}'`, lineNumber);
      }

      // Добавляем NEWLINE токен в конце каждой обработанной строки
      // Но не добавляем NEWLINE если это последняя строка
      if (lineIndex < lines.length - 1) {
        tokens.push({ type: TokenType.NEWLINE, value: '', line: lineNumber });
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', line: lineNumber });
    return tokens;
  }

  async parseConlogChain(tokens: Token[], start: number): Promise<{node: ASTNode | null, newPosition: number}> {
    let current = start;
    const commands: any[] = [];
    
    // Парсим первый conlog
    if (tokens[current].type === TokenType.KEYWORD && tokens[current].value === 'conlog') {
      current++;
      const nextToken = tokens[current];
      
      if (nextToken?.type === TokenType.STRING) {
        commands.push({
          type: 'FunctionCall',
          name: 'conlog',
          args: [{ type: 'String', value: nextToken.value }]
        });
        current++;
      } else if (nextToken?.type === TokenType.PARENTHESIS && nextToken.value === '(') {
        current++;
        const varToken = tokens[current];
        current++;
        const closeToken = tokens[current];
        current++;
        
        commands.push({
          type: 'FunctionCall',
          name: 'conlog',
          args: [{ type: 'Variable', name: varToken.value }]
        });
      }
      
      // Проверяем есть ли && после
      while (current < tokens.length && 
             tokens[current].type === TokenType.LOGICAL && 
             tokens[current].value === '&&') {
        current++; // пропускаем &&
        
        // Проверяем что после && идет conlog
        if (tokens[current]?.type === TokenType.KEYWORD && tokens[current].value === 'conlog') {
          current++;
          const nextToken = tokens[current];
          
          if (nextToken?.type === TokenType.STRING) {
            commands.push({
              type: 'FunctionCall',
              name: 'conlog',
              args: [{ type: 'String', value: nextToken.value }]
            });
            current++;
          } else if (nextToken?.type === TokenType.PARENTHESIS && nextToken.value === '(') {
            current++;
            const varToken = tokens[current];
            current++;
            const closeToken = tokens[current];
            current++;
            
            commands.push({
              type: 'FunctionCall',
              name: 'conlog',
              args: [{ type: 'Variable', name: varToken.value }]
            });
          }
        } else {
          break; // Если после && не conlog, прерываем цепочку
        }
      }
    }
    
    if (commands.length > 1) {
      return {
        node: {
          type: 'ConlogChain',
          commands: commands
        },
        newPosition: current
      };
    }
    
    return { node: null, newPosition: start };
  }

  async parse(tokens: Token[]): Promise<ASTNode[]> {
    const ast: ASTNode[] = [];
    let current = 0;

    while (current < tokens.length && tokens[current].type !== TokenType.EOF) {
      const token = tokens[current];


      if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
        // Пробуем сначала распарсить как цепочку
        const chainResult = await this.parseConlogChain(tokens, current);
        if (chainResult.node) {
          ast.push(chainResult.node);
          current = chainResult.newPosition;
        } else {
          // Обычный одиночный conlog
          current++;
          const nextToken = tokens[current];
          
          if (!nextToken || nextToken.type === TokenType.EOF) {
            ErrorHandler.throwError('Команда conlog требует аргумент. Используйте: conlog "текст" или conlog (переменная)', token.line);
          }
          
          if (nextToken.type === TokenType.STRING) {
            ast.push({
              type: 'FunctionCall',
              name: 'conlog',
              args: [{ type: 'String', value: nextToken.value }]
            });
            current++;
          } else if (nextToken.type === TokenType.PARENTHESIS && nextToken.value === '(') {
            current++;
            const varToken = tokens[current];
            
            if (!varToken || varToken.type !== TokenType.IDENTIFIER) {
              ErrorHandler.throwError('Неправильный синтаксис conlog. Используйте: conlog (имя_переменной)', token.line);
            }
            
            current++;
            const closeToken = tokens[current];
            
            if (!closeToken || closeToken.value !== ')') {
              ErrorHandler.throwError('Незакрытая скобка в conlog. Добавьте закрывающую скобку )', token.line);
            }
            
            ast.push({
              type: 'FunctionCall', 
              name: 'conlog',
              args: [{ type: 'Variable', name: varToken.value }]
            });
            current++;
          } else {
            ErrorHandler.throwError('Неправильный аргумент для conlog. Используйте: conlog "строка" или conlog (переменная)', nextToken.line);
          }
        }
      } else if (token.type === TokenType.IDENTIFIER) {
        const nextToken = tokens[current + 1];
        if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
          current += 2;
          const valueToken = tokens[current];
          
          if (!valueToken) {
            ErrorHandler.throwError('Неполное присваивание переменной. Добавьте значение после знака =', token.line);
          }
          
          if (valueToken.type === TokenType.STRING) {
            ast.push({
              type: 'VariableAssignment', 
              name: token.value,
              value: { type: 'String', value: valueToken.value }
            });
            current++;
          } else if (valueToken.type === TokenType.NUMBER && (current + 1 >= tokens.length || 
                     tokens[current + 1].type === TokenType.NEWLINE || 
                     tokens[current + 1].type === TokenType.EOF ||
                     tokens[current + 1].type === TokenType.KEYWORD)) {
            ast.push({
              type: 'VariableAssignment',
              name: token.value,
              value: { type: 'Number', value: parseInt(valueToken.value) }
            });
            current++;
                      } else if (valueToken.type === TokenType.IDENTIFIER && tokens[current + 1] && tokens[current + 1].type === TokenType.DOT) {
              // Присваивание результата вызова функции модуля: var = module.function()
              const moduleToken = valueToken;
              current += 2; // пропускаем модуль и точку
              const functionToken = tokens[current];
              
              if (functionToken && functionToken.type === TokenType.IDENTIFIER) {
                current++;
                const openParenToken = tokens[current];
                
                if (openParenToken && openParenToken.value === '(') {
                  current++;
                  
                  // Собираем аргументы функции
                  const args: any[] = [];
                  while (current < tokens.length && tokens[current].value !== ')') {
                    const argToken = tokens[current];
                    if (argToken.type === TokenType.STRING) {
                      args.push({ type: 'String', value: argToken.value });
                    } else if (argToken.type === TokenType.NUMBER) {
                      args.push({ type: 'Number', value: parseInt(argToken.value) });
                    } else if (argToken.type === TokenType.IDENTIFIER) {
                      args.push({ type: 'Variable', name: argToken.value });
                    }
                    current++;
                  }
                  
                  if (tokens[current] && tokens[current].value === ')') {
                    current++;
                    
                                         // Создаем узел для отложенного вызова функции модуля
                     ast.push({
                       type: 'VariableAssignment',
                       name: token.value,
                       value: { 
                         type: 'ModuleCall', 
                         module: moduleToken.value,
                         function: functionToken.value,
                         args: args
                       }
                     });
                  }
                }
              }
            } else if (valueToken.type === TokenType.BLOCK_START) {
              // Блочное присваивание
              current++; // пропускаем **!
              let blockCode = '';
              
              // Ищем закрывающий маркер !**
              while (current < tokens.length && tokens[current].type !== TokenType.BLOCK_END && tokens[current].type !== TokenType.EOF) {
                const currentToken = tokens[current];
                
                if (currentToken.type === TokenType.NEWLINE) {
                  blockCode += '\n';
                } else if (currentToken.type === TokenType.INDENT) {
                  blockCode += '  '; // отступ = 2 пробела
                } else if (currentToken.type === TokenType.DEDENT) {
                  // dedent игнорируем
                } else {
                  // Восстанавливаем кавычки для строк
                  if (currentToken.type === TokenType.STRING) {
                    blockCode += '"' + currentToken.value + '"';
                  } else {
                    blockCode += currentToken.value;
                  }
                  
                  // Добавляем пробел после токена если следующий не NEWLINE/DEDENT/BLOCK_END
                  if (tokens[current + 1] && 
                      tokens[current + 1].type !== TokenType.NEWLINE &&
                      tokens[current + 1].type !== TokenType.DEDENT &&
                      tokens[current + 1].type !== TokenType.BLOCK_END) {
                    blockCode += ' ';
                  }
                }
                current++;
              }
              
              if (tokens[current] && tokens[current].type === TokenType.BLOCK_END) {
                current++; // пропускаем !**
                
                ast.push({
                  type: 'VariableAssignment',
                  name: token.value,
                  value: { type: 'BlockCode', code: blockCode.trim() }
                });
              } else {
                ErrorHandler.throwError('Незакрытый блок кода. Добавьте !**', token.line);
              }
            } else {
              // Все остальные случаи - собираем как выражение до конца строки
              let expression = '';
              while (current < tokens.length && 
                     tokens[current].type !== TokenType.DEDENT && 
                     tokens[current].type !== TokenType.KEYWORD &&
                     tokens[current].type !== TokenType.NEWLINE) {
                expression += tokens[current].value + ' ';
                current++;
              }
              ast.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'Expression', expression: expression.trim() }
              });
            }
        } else if (nextToken && nextToken.type === TokenType.DOT) {
          // Вызов функции модуля: module.function()
          current += 2; // пропускаем модуль и точку
          const functionToken = tokens[current];
          
          if (functionToken && functionToken.type === TokenType.IDENTIFIER) {
            current++;
            const openParenToken = tokens[current];
            
            if (openParenToken && openParenToken.value === '(') {
              current++;
              
              // Собираем аргументы функции
              const args: any[] = [];
              while (current < tokens.length && tokens[current].value !== ')') {
                const argToken = tokens[current];
                if (argToken.type === TokenType.STRING) {
                  args.push({ type: 'String', value: argToken.value });
                } else if (argToken.type === TokenType.NUMBER) {
                  args.push({ type: 'Number', value: parseInt(argToken.value) });
                } else if (argToken.type === TokenType.IDENTIFIER) {
                  args.push({ type: 'Variable', name: argToken.value });
                }
                current++;
              }
              
              if (tokens[current] && tokens[current].value === ')') {
                current++;
                ast.push({
                  type: 'ModuleFunctionCall',
                  module: token.value,
                  function: functionToken.value,
                  args: args
                });
              }
            }
          }
        } else {
          ErrorHandler.throwError(`Неопознанная конструкция '${token.value}'`, token.line);
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'codego') {
        current++;
        const colonToken = tokens[current];
        
        if (!colonToken || colonToken.value !== ':') {
          ErrorHandler.throwError('Неправильный синтаксис codego. Используйте: codego:(имя_переменной)', token.line);
        }
        
        current++;
        const openToken = tokens[current];
        
        if (!openToken || openToken.value !== '(') {
          ErrorHandler.showCriticalError(
            'Отсутствует скобка в codego',
            token.line,
            'Используйте: codego:(имя_переменной)'
          );
          current++;
          continue;
        }
        
            current++;
            const varToken = tokens[current];
        
        if (!varToken || varToken.type !== TokenType.IDENTIFIER) {
          ErrorHandler.showCriticalError(
            'Неправильное имя переменной в codego',
            token.line,
            'Укажите имя переменной: codego:(mycode)'
          );
          current++;
          continue;
        }
        
            current++;
        const closeToken = tokens[current];
        
        if (!closeToken || closeToken.value !== ')') {
          ErrorHandler.showCriticalError(
            'Незакрытая скобка в codego',
            token.line,
            'Добавьте закрывающую скобку )'
          );
        } else {
          if (!this.variables.has(varToken.value)) {
            ErrorHandler.showWarning(
              'Переменная для codego не определена',
              varToken.line,
              varToken.value
            );
          }
          
              ast.push({
                type: 'CodeExecution',
                variable: varToken.value
              });
              current++;
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'imp') {
        current++;
        const moduleToken = tokens[current];
        
        if (!moduleToken || moduleToken.type !== TokenType.IDENTIFIER) {
          ErrorHandler.throwError('Команда imp требует имя модуля. Используйте: imp имя_модуля', token.line);
        }
        
        ast.push({
          type: 'ModuleImport',
          module: moduleToken.value
        });
        current++;
      } else if (token.type === TokenType.KEYWORD && token.value === 'if') {
        const ifNode = await this.parseIfStatement(tokens, current);
        if (ifNode.node) {
          ast.push(ifNode.node);
        }
        current = ifNode.newPosition;
      } else if (token.type === TokenType.KEYWORD && token.value === 'while') {
        const whileNode = await this.parseWhileStatement(tokens, current);
        if (whileNode.node) {
          ast.push(whileNode.node);
        }
        current = whileNode.newPosition;
      } else if (token.type === TokenType.KEYWORD && token.value === 'for') {
        const forNode = await this.parseForStatement(tokens, current);
        if (forNode.node) {
          ast.push(forNode.node);
        }
        current = forNode.newPosition;
      } else if (token.type === TokenType.NEWLINE || token.type === TokenType.INDENT || token.type === TokenType.DEDENT) {
        // Просто пропускаем токены новой строки и отступов в основном цикле
        current++;
      } else {
        ErrorHandler.throwError(`Неопознанный токен '${token.value}'`, token.line);
      }
    }

    return ast;
  }

  async parseIfStatement(tokens: Token[], start: number): Promise<{node: ASTNode | null, newPosition: number}> {
    let current = start + 1;
    
    if (!tokens[current] || tokens[current].value !== '(') {
      ErrorHandler.showCriticalError(
        'Ожидается скобка после if',
        tokens[start].line,
        'Используйте: if (условие)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const condition = await this.parseCondition(tokens, current);
    current = condition.newPosition;
    
    if (!tokens[current] || tokens[current].value !== ')') {
      ErrorHandler.showCriticalError(
        'Ожидается закрывающая скобка',
        tokens[start].line,
        'Добавьте ) после условия'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    // Пропускаем NEWLINE токены
    while (current < tokens.length && tokens[current].type === TokenType.NEWLINE) {
      current++;
    }
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после условия',
        tokens[start].line,
        'Сделайте отступ для блока кода'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const body = await this.parseIndentedBlock(tokens, current);
    current = body.newPosition;
    
    // Пропускаем DEDENT токены после блока if
    while (current < tokens.length && tokens[current].type === TokenType.DEDENT) {
      current++;
    }
    
    let elseBody = null;
    if (tokens[current] && tokens[current].type === TokenType.KEYWORD && tokens[current].value === 'else') {
      current++;
      
      // Пропускаем NEWLINE токены
      while (current < tokens.length && tokens[current].type === TokenType.NEWLINE) {
        current++;
      }
      
      if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
        ErrorHandler.showCriticalError(
          'Ожидается отступ после else',
          tokens[current-1].line,
          'Сделайте отступ для блока else'
        );
        return { node: null, newPosition: current };
      }
      
      current++;
      const elseResult = await this.parseIndentedBlock(tokens, current);
      elseBody = elseResult.body;
      current = elseResult.newPosition;
    }
    
    return {
      node: {
        type: 'IfStatement',
        condition: condition.condition,
        body: body.body,
        elseBody: elseBody
      },
      newPosition: current
    };
  }

  async parseWhileStatement(tokens: Token[], start: number): Promise<{node: ASTNode | null, newPosition: number}> {
    let current = start + 1;
    
    if (!tokens[current] || tokens[current].value !== '(') {
      ErrorHandler.showCriticalError(
        'Ожидается скобка после while',
        tokens[start].line,
        'Используйте: while (условие)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const condition = await this.parseCondition(tokens, current);
    current = condition.newPosition;
    
    if (!tokens[current] || tokens[current].value !== ')') {
      ErrorHandler.showCriticalError(
        'Ожидается закрывающая скобка',
        tokens[start].line,
        'Добавьте ) после условия'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    // Пропускаем NEWLINE токены
    while (current < tokens.length && tokens[current].type === TokenType.NEWLINE) {
      current++;
    }
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после условия',
        tokens[start].line,
        'Сделайте отступ для блока кода'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const body = await this.parseIndentedBlock(tokens, current);
    current = body.newPosition;
    
    return {
      node: {
        type: 'WhileStatement',
        condition: condition.condition,
        body: body.body
      },
      newPosition: current
    };
  }

  async parseForStatement(tokens: Token[], start: number): Promise<{node: ASTNode | null, newPosition: number}> {
    let current = start + 1;
    
    if (!tokens[current] || tokens[current].value !== '(') {
      ErrorHandler.showCriticalError(
        'Ожидается скобка после for',
        tokens[start].line,
        'Используйте: for (i = 0; i < 10; i = i + 1)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    const initToken = tokens[current];
    if (!initToken || initToken.type !== TokenType.IDENTIFIER) {
      ErrorHandler.showCriticalError(
        'Ожидается переменная в for',
        tokens[start].line,
        'Используйте: for (переменная = начало; ...'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    if (!tokens[current] || tokens[current].value !== '=') {
      ErrorHandler.showCriticalError(
        'Ожидается = в for',
        tokens[start].line,
        'Используйте: for (i = 0; ...'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const startValueToken = tokens[current];
    if (!startValueToken || startValueToken.type !== TokenType.NUMBER) {
      ErrorHandler.showCriticalError(
        'Ожидается число в for',
        tokens[start].line,
        'Используйте: for (i = 0; ...'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    if (!tokens[current] || tokens[current].value !== ';') {
      ErrorHandler.showCriticalError(
        'Ожидается ; в for',
        tokens[start].line,
        'Используйте: for (i = 0; условие; ...'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const condition = await this.parseCondition(tokens, current);
    current = condition.newPosition;
    
    if (!tokens[current] || tokens[current].value !== ';') {
      ErrorHandler.showCriticalError(
        'Ожидается ; после условия в for',
        tokens[start].line,
        'Используйте: for (...; условие; инкремент)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    const incrementVar = tokens[current];
    if (!incrementVar || incrementVar.type !== TokenType.IDENTIFIER) {
      ErrorHandler.showCriticalError(
        'Ожидается переменная в инкременте for',
        tokens[start].line,
        'Используйте: for (...; ...; i = i + 1)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    if (!tokens[current] || tokens[current].value !== '=') {
      ErrorHandler.showCriticalError(
        'Ожидается = в инкременте for',
        tokens[start].line,
        'Используйте: for (...; ...; i = i + 1)'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    let incrementExpr = '';
    while (current < tokens.length && tokens[current].value !== ')') {
      incrementExpr += tokens[current].value + ' ';
      current++;
    }
    
    if (!tokens[current] || tokens[current].value !== ')') {
      ErrorHandler.showCriticalError(
        'Ожидается закрывающая скобка в for',
        tokens[start].line,
        'Добавьте ) в конце for'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    // Пропускаем NEWLINE токены
    while (current < tokens.length && tokens[current].type === TokenType.NEWLINE) {
      current++;
    }
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после условия',
        tokens[start].line,
        'Сделайте отступ для блока кода'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const body = await this.parseIndentedBlock(tokens, current);
    current = body.newPosition;
    
    return {
      node: {
        type: 'ForStatement',
        variable: initToken.value,
        startValue: parseInt(startValueToken.value),
        condition: condition.condition,
        increment: incrementExpr.trim(),
        body: body.body
      },
      newPosition: current
    };
  }

  async parseCondition(tokens: Token[], start: number): Promise<{condition: any, newPosition: number}> {
    let current = start;
    
    // Парсим левую часть до оператора
    let leftSide = '';
    while (current < tokens.length && 
           tokens[current].type !== TokenType.COMPARISON && 
           tokens[current].type !== TokenType.LOGICAL &&
           tokens[current].value !== ')' && 
           tokens[current].value !== ';') {
      if (tokens[current].type === TokenType.STRING) {
        leftSide += '"' + tokens[current].value + '"';
      } else {
        leftSide += tokens[current].value;
      }
      leftSide += ' ';
      current++;
    }
    
    if (current >= tokens.length || 
        (tokens[current].type !== TokenType.COMPARISON && tokens[current].type !== TokenType.LOGICAL)) {
      return {
        condition: { left: leftSide.trim(), operator: '==', right: 'true' },
        newPosition: current
      };
    }
    
    const operator = tokens[current].value;
    current++;
    
    // Для логических операторов парсим рекурсивно
    if (operator === '&&' || operator === '||') {
      const rightCondition = await this.parseCondition(tokens, current);
      return {
        condition: {
          operator: operator,
          left: { left: leftSide.trim(), operator: '==', right: 'true' },
          right: rightCondition.condition
        },
        newPosition: rightCondition.newPosition
      };
    }
    
    // Для операторов сравнения парсим правую часть
    let rightSide = '';
    while (current < tokens.length && 
           tokens[current].type !== TokenType.LOGICAL &&
           tokens[current].value !== ')' && 
           tokens[current].value !== ';') {
      if (tokens[current].type === TokenType.STRING) {
        rightSide += '"' + tokens[current].value + '"';
      } else {
        rightSide += tokens[current].value;
      }
      rightSide += ' ';
      current++;
    }
    
    const condition = {
      left: leftSide.trim(),
      operator: operator,
      right: rightSide.trim()
    };
    
    // Проверяем есть ли логический оператор после
    if (current < tokens.length && tokens[current].type === TokenType.LOGICAL) {
      const logicalOp = tokens[current].value;
      current++;
      const rightCondition = await this.parseCondition(tokens, current);
      
      return {
        condition: {
          operator: logicalOp,
          left: condition,
          right: rightCondition.condition
        },
        newPosition: rightCondition.newPosition
      };
    }
    
    return {
      condition: condition,
      newPosition: current
    };
  }

  async parseIndentedBlock(tokens: Token[], start: number): Promise<{body: ASTNode[], newPosition: number}> {
    const body: ASTNode[] = [];
    let current = start;
    
    while (current < tokens.length && tokens[current].type !== TokenType.DEDENT && tokens[current].type !== TokenType.EOF) {
      const token = tokens[current];
      
      if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
        // Пробуем сначала распарсить как цепочку
        const chainResult = await this.parseConlogChain(tokens, current);
        if (chainResult.node) {
          body.push(chainResult.node);
          current = chainResult.newPosition;
        } else {
          // Обычный одиночный conlog
          current++;
          const nextToken = tokens[current];
          
          if (nextToken && nextToken.type === TokenType.STRING) {
            body.push({
              type: 'FunctionCall',
              name: 'conlog',
              args: [{ type: 'String', value: nextToken.value }]
            });
            current++;
          } else if (nextToken && nextToken.type === TokenType.PARENTHESIS && nextToken.value === '(') {
            current++;
            const varToken = tokens[current];
            
            if (varToken && varToken.type === TokenType.IDENTIFIER) {
              current++;
              const closeToken = tokens[current];
              
              if (closeToken && closeToken.value === ')') {
                body.push({
                  type: 'FunctionCall',
                  name: 'conlog',
                  args: [{ type: 'Variable', name: varToken.value }]
                });
                current++;
              }
            }
          }
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'if') {
        const ifNode = await this.parseIfStatement(tokens, current);
        if (ifNode.node) {
          body.push(ifNode.node);
        }
        current = ifNode.newPosition;
      } else if (token.type === TokenType.KEYWORD && token.value === 'while') {
        const whileNode = await this.parseWhileStatement(tokens, current);
        if (whileNode.node) {
          body.push(whileNode.node);
        }
        current = whileNode.newPosition;
      } else if (token.type === TokenType.KEYWORD && token.value === 'for') {
        const forNode = await this.parseForStatement(tokens, current);
        if (forNode.node) {
          body.push(forNode.node);
        }
        current = forNode.newPosition;
      } else if (token.type === TokenType.KEYWORD && token.value === 'imp') {
        current++;
        const moduleToken = tokens[current];
        if (moduleToken && moduleToken.type === TokenType.IDENTIFIER) {
          body.push({
            type: 'ModuleImport',
            module: moduleToken.value
          });
          current++;
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'codego') {
        current++;
        const colonToken = tokens[current];
        if (colonToken && colonToken.value === ':') {
          current++;
          const openToken = tokens[current];
          if (openToken && openToken.value === '(') {
            current++;
            const varToken = tokens[current];
            if (varToken && varToken.type === TokenType.IDENTIFIER) {
              current++;
              const closeToken = tokens[current];
              if (closeToken && closeToken.value === ')') {
                body.push({
                  type: 'CodeExecution',
                  variable: varToken.value
                });
                current++;
              }
            }
          }
        }
      } else if (token.type === TokenType.IDENTIFIER) {
        const nextToken = tokens[current + 1];
        if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
          current += 2;
          const valueToken = tokens[current];
          
          if (valueToken) {
            if (valueToken.type === TokenType.NUMBER && (current + 1 >= tokens.length || 
                tokens[current + 1].type === TokenType.DEDENT || tokens[current + 1].type === TokenType.KEYWORD)) {
              body.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'Number', value: parseInt(valueToken.value) }
              });
              current++;
            } else if (valueToken.type === TokenType.STRING && (current + 1 >= tokens.length || 
                      tokens[current + 1].type === TokenType.DEDENT || tokens[current + 1].type === TokenType.KEYWORD)) {
              body.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'String', value: valueToken.value }
              });
              current++;
            } else if (valueToken.type === TokenType.IDENTIFIER && tokens[current + 1] && tokens[current + 1].type === TokenType.DOT) {
              // Присваивание результата вызова функции модуля: var = module.function()
              const moduleToken = valueToken;
              current += 2; // пропускаем модуль и точку
              const functionToken = tokens[current];
              
              if (functionToken && functionToken.type === TokenType.IDENTIFIER) {
                current++;
                const openParenToken = tokens[current];
                
                if (openParenToken && openParenToken.value === '(') {
                  current++;
                  
                  // Собираем аргументы функции
                  const args: any[] = [];
                  while (current < tokens.length && tokens[current].value !== ')') {
                    const argToken = tokens[current];
                    if (argToken.type === TokenType.STRING) {
                      args.push({ type: 'String', value: argToken.value });
                    } else if (argToken.type === TokenType.NUMBER) {
                      args.push({ type: 'Number', value: parseInt(argToken.value) });
                    } else if (argToken.type === TokenType.IDENTIFIER) {
                      args.push({ type: 'Variable', name: argToken.value });
                    }
                    current++;
                  }
                  
                  if (tokens[current] && tokens[current].value === ')') {
                    current++;
                    
                    body.push({
                      type: 'VariableAssignment',
                      name: token.value,
                      value: { 
                        type: 'ModuleCall', 
                        module: moduleToken.value,
                        function: functionToken.value,
                        args: args
                      }
                    });
                  }
                }
              }
            } else {
              let expression = '';
              while (current < tokens.length && 
                     tokens[current].type !== TokenType.DEDENT && 
                     tokens[current].type !== TokenType.KEYWORD &&
                     tokens[current].type !== TokenType.NEWLINE) {
                expression += tokens[current].value + ' ';
                current++;
              }
              body.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'Expression', expression: expression.trim() }
              });
            }
          }
        } else if (nextToken && nextToken.type === TokenType.DOT) {
          // Вызов функции модуля: module.function()
          current += 2; // пропускаем модуль и точку
          const functionToken = tokens[current];
          
          if (functionToken && functionToken.type === TokenType.IDENTIFIER) {
            current++;
            const openParenToken = tokens[current];
            
            if (openParenToken && openParenToken.value === '(') {
              current++;
              
              // Собираем аргументы функции
              const args: any[] = [];
              while (current < tokens.length && tokens[current].value !== ')') {
                const argToken = tokens[current];
                if (argToken.type === TokenType.STRING) {
                  args.push({ type: 'String', value: argToken.value });
                } else if (argToken.type === TokenType.NUMBER) {
                  args.push({ type: 'Number', value: parseInt(argToken.value) });
                } else if (argToken.type === TokenType.IDENTIFIER) {
                  args.push({ type: 'Variable', name: argToken.value });
                }
                current++;
              }
              
              if (tokens[current] && tokens[current].value === ')') {
                current++;
                body.push({
                  type: 'ModuleFunctionCall',
                  module: token.value,
                  function: functionToken.value,
                  args: args
                });
              }
            }
          }
        } else {
          current++;
        }
      } else if (token.type === TokenType.NEWLINE || 
                 token.type === TokenType.INDENT || 
                 token.type === TokenType.DEDENT) {
        current++; // Пропускаем служебные токены
      } else {
        current++;
      }
    }
    
    return { body, newPosition: current };
  }

  async execute(ast: ASTNode[]): Promise<void> {
    for (const node of ast) {
      switch (node.type) {
        case 'ConlogChain':
          let output = '';
          for (let i = 0; i < node.commands.length; i++) {
            const command = node.commands[i];
            if (command.args[0].type === 'String') {
              output += command.args[0].value;
            } else if (command.args[0].type === 'Variable') {
              const value = this.variables.get(command.args[0].name);
              if (value === undefined) {
                console.log(`❌ Ошибка: переменная '${command.args[0].name}' не определена`);
                return;
              }
              output += value;
            }
            // Добавляем пробел между элементами цепочки (кроме последнего)
            if (i < node.commands.length - 1) {
              output += ' ';
            }
          }
          console.log(output);
          break;

        case 'FunctionCall':
          if (node.name === 'conlog') {
            if (node.args[0].type === 'String') {
              console.log(node.args[0].value);
            } else if (node.args[0].type === 'Variable') {
              const value = this.variables.get(node.args[0].name);
              if (value === undefined) {
                console.log(`❌ Ошибка: переменная '${node.args[0].name}' не определена`);
                return;
              }
              console.log(value);
            }
          }
          break;

        case 'VariableAssignment':
          if (node.value.type === 'Number') {
            this.variables.set(node.name, node.value.value);
          } else if (node.value.type === 'String') {
            this.variables.set(node.name, node.value.value);
          } else if (node.value.type === 'Expression') {
            try {
              const result = this.evaluateExpression(node.value.expression);
              this.variables.set(node.name, result);
            } catch (error: any) {
              console.log(`❌ Ошибка вычисления: ${error.message}`);
              return;
            }
          } else if (node.value.type === 'ModuleCall') {
            // Выполняем вызов функции модуля и сохраняем результат
            const moduleObj = this.modules.get(node.value.module);
            if (moduleObj && typeof moduleObj[node.value.function] === 'function') {
              const processedArgs = node.value.args.map((arg: any) => {
                if (arg.type === 'String') return arg.value;
                if (arg.type === 'Number') return arg.value;
                if (arg.type === 'Variable') return this.variables.get(arg.name);
                return arg.value;
              });
              
              try {
                const result = moduleObj[node.value.function](...processedArgs);
                this.variables.set(node.name, result);
              } catch (error) {
                console.log(`❌ Ошибка вызова ${node.value.module}.${node.value.function}:`, error);
                this.variables.set(node.name, 0);
              }
            } else {
              console.log(`❌ Функция ${node.value.function} не найдена в модуле ${node.value.module}`);
              this.variables.set(node.name, 0);
            }
          } else if (node.value.type === 'BlockCode') {
            this.variables.set(node.name, node.value.code);
          }
          break;

        case 'CodeExecution':
          const code = this.variables.get(node.variable);
          if (typeof code === 'string') {
            const tokens = this.tokenize(code);
            const codeAst = await this.parse(tokens);
            await this.execute(codeAst);
          }
          break;

        case 'ModuleImport':
          this.loadModule(node.module);
          break;

        case 'ModuleFunctionCall':
          const moduleObj = this.modules.get(node.module);
          if (moduleObj && typeof moduleObj[node.function] === 'function') {
            const args = node.args.map((arg: any) => {
              if (arg.type === 'String') return arg.value;
              if (arg.type === 'Number') return arg.value;
              if (arg.type === 'Variable') return this.variables.get(arg.name);
              return arg.value;
            });
            
            try {
              moduleObj[node.function](...args);
            } catch (error) {
              console.log(`❌ Ошибка вызова ${node.module}.${node.function}:`, error);
            }
          } else {
            console.log(`❌ Функция ${node.function} не найдена в модуле ${node.module}`);
          }
          break;

        case 'IfStatement':
          const conditionResult = this.evaluateCondition(node.condition);
          if (conditionResult) {
            await this.execute(node.body);
          } else if (node.elseBody) {
            await this.execute(node.elseBody);
          }
          break;

        case 'WhileStatement':
          while (this.evaluateCondition(node.condition)) {
            await this.execute(node.body);
          }
          break;

        case 'ForStatement':
          this.variables.set(node.variable, node.startValue);
          while (this.evaluateCondition(node.condition)) {
            await this.execute(node.body);
            const incrementResult = this.evaluateExpression(node.increment);
            this.variables.set(node.variable, incrementResult);
          }
          break;
      }
    }
  }

  evaluateCondition(condition: any): boolean {
    // Обработка логических операторов
    if (condition.operator === '&&') {
      return this.evaluateCondition(condition.left) && this.evaluateCondition(condition.right);
    }
    if (condition.operator === '||') {
      return this.evaluateCondition(condition.left) || this.evaluateCondition(condition.right);
    }
    if (condition.operator === '!') {
      return !this.evaluateCondition(condition.operand);
    }
    
    // Обычные операторы сравнения
    const left = this.resolveValue(condition.left);
    const right = this.resolveValue(condition.right);
    
    switch (condition.operator) {
      case '==': return left === right;
      case '!=': return left !== right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      default: return false;
    }
  }

  resolveValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    // Обрабатываем строковые литералы в кавычках
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1); // убираем кавычки
    }
    // Проверяем переменные СНАЧАЛА и возвращаем их значение как есть
    if (this.variables.has(value)) return this.variables.get(value);
    // Преобразуем в числа ТОЛЬКО если значение не найдено в переменных И оно чисто числовое
    if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  }

  evaluateModuleCall(expr: string): any {
    try {
      // Парсим выражение вида "module.function(args)"
      const dotIndex = expr.indexOf('.');
      const openParenIndex = expr.indexOf('(');
      const closeParenIndex = expr.lastIndexOf(')');
      
      if (dotIndex === -1 || openParenIndex === -1 || closeParenIndex === -1) {
        throw new Error('Неправильный формат вызова модуля');
      }
      
      const moduleName = expr.substring(0, dotIndex).trim();
      const functionName = expr.substring(dotIndex + 1, openParenIndex).trim();
      const argsStr = expr.substring(openParenIndex + 1, closeParenIndex).trim();
      
      // Парсим аргументы
      const args: any[] = [];
      if (argsStr.length > 0) {
        if (argsStr.startsWith('"') && argsStr.endsWith('"')) {
          // Строковый аргумент
          args.push(argsStr.slice(1, -1));
        } else if (!isNaN(Number(argsStr))) {
          // Числовой аргумент
          args.push(Number(argsStr));
        } else if (this.variables.has(argsStr)) {
          // Переменная
          args.push(this.variables.get(argsStr));
        } else {
          args.push(argsStr);
        }
      }
      
      // Вызываем функцию модуля
      const moduleObj = this.modules.get(moduleName);
      if (moduleObj && typeof moduleObj[functionName] === 'function') {
        return moduleObj[functionName](...args);
      } else {
        throw new Error(`Функция ${functionName} не найдена в модуле ${moduleName}`);
      }
    } catch (error: any) {
      throw new Error(`Ошибка вызова модуля: ${error.message}`);
    }
  }

  evaluateExpression(expr: string): any {
    try {
      let processedExpr = expr.trim();
      
      // Проверяем если это вызов функции модуля
      if (processedExpr.includes('.') && processedExpr.includes('(') && processedExpr.includes(')')) {
        return this.evaluateModuleCall(processedExpr);
      }
      
      // Проверяем если это простая строка без математических операторов
      if (!/[+\-*/()]/.test(processedExpr) && !processedExpr.match(/^\d+$/)) {
        // Если не содержит математических операторов и не является числом, возвращаем как строку
        return processedExpr;
      }
      
      // Заменяем переменные на их значения
      this.variables.forEach((varValue, varName) => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        processedExpr = processedExpr.replace(regex, String(varValue));
      });
      
      // Проверяем, что выражение содержит только допустимые символы
      if (!/^[0-9+\-*/.() ]+$/.test(processedExpr)) {
        throw new Error(`Недопустимые символы в выражении: ${expr}`);
      }
      
      // Проверяем скобки
      let openCount = 0;
      for (const char of processedExpr) {
        if (char === '(') openCount++;
        if (char === ')') openCount--;
        if (openCount < 0) throw new Error(`Неправильные скобки в выражении: ${expr}`);
      }
      if (openCount !== 0) throw new Error(`Незакрытые скобки в выражении: ${expr}`);
      
      // Безопасное вычисление без eval
      return this.safeEvaluate(processedExpr);
    } catch (error: any) {
      throw new Error(`Ошибка вычисления выражения "${expr}": ${error.message}`);
    }
  }

  private safeEvaluate(expr: string): number {
    // Простой математический парсер без eval
    expr = expr.replace(/\s/g, ''); // Убираем пробелы
    
    // Обработка скобок
    while (expr.includes('(')) {
      const start = expr.lastIndexOf('(');
      const end = expr.indexOf(')', start);
      if (end === -1) throw new Error('Незакрытая скобка');
      
      const innerExpr = expr.substring(start + 1, end);
      const result = this.evaluateSimpleExpression(innerExpr);
      expr = expr.substring(0, start) + result + expr.substring(end + 1);
    }
    
    return this.evaluateSimpleExpression(expr);
  }

  private evaluateSimpleExpression(expr: string): number {
    // Обработка умножения и деления
    let parts = expr.split(/([*/])/);
    let result = parseFloat(parts[0]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = parseFloat(parts[i + 1]);
      
      if (operator === '*') {
        result *= operand;
      } else if (operator === '/') {
        if (operand === 0) throw new Error('Деление на ноль');
        result /= operand;
      }
    }
    
    // Если есть сложение/вычитание, обрабатываем их
    if (expr.includes('+') || expr.includes('-')) {
      return this.evaluateAddSubtract(expr);
    }
    
    return result;
  }

  private evaluateAddSubtract(expr: string): number {
    const parts = expr.split(/([+-])/);
    let result = this.evaluateMultiplyDivide(parts[0]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = this.evaluateMultiplyDivide(parts[i + 1]);
      
      if (operator === '+') {
        result += operand;
      } else if (operator === '-') {
        result -= operand;
      }
    }
    
    return result;
  }

  private evaluateMultiplyDivide(expr: string): number {
    const parts = expr.split(/([*/])/);
    let result = parseFloat(parts[0]);
    
    for (let i = 1; i < parts.length; i += 2) {
      const operator = parts[i];
      const operand = parseFloat(parts[i + 1]);
      
      if (operator === '*') {
        result *= operand;
      } else if (operator === '/') {
        if (operand === 0) throw new Error('Деление на ноль');
        result /= operand;
      }
    }
    
    return result;
  }

  loadModule(moduleName: string): void {
    try {
      // Проверяем несколько возможных путей
      const possiblePaths = [
        path.join(process.cwd(), 'crack_modules', moduleName, 'src', 'index.js'),
        path.join(process.cwd(), 'test', 'crack_modules', moduleName, 'src', 'index.js'),
        path.join(process.cwd(), '..', 'test', 'crack_modules', moduleName, 'src', 'index.js'),
        path.join(__dirname, '..', 'test', 'crack_modules', moduleName, 'src', 'index.js'),
        path.join(__dirname, '..', '..', 'test', 'crack_modules', moduleName, 'src', 'index.js')
      ];
      
      let moduleLoaded = false;
      
      for (const modulePath of possiblePaths) {
        if (fs.existsSync(modulePath)) {
          const moduleExports = require(modulePath);
          this.modules.set(moduleName, moduleExports);
          moduleLoaded = true;
          break;
        }
      }
      
      if (!moduleLoaded) {
        console.log(`❌ Модуль ${moduleName} не найден`);
      }
    } catch (error) {
      console.log(`❌ Ошибка загрузки модуля ${moduleName}:`, error);
    }
  }

  async run(filename: string): Promise<void> {
    this.currentFilename = filename;
    try {
      const code = fs.readFileSync(filename, 'utf-8');
      const tokens = this.tokenize(code);
      const ast = await this.parse(tokens);
      await this.execute(ast);
    } catch (error) {
      console.log(`❌ Ошибка синтаксиса:`);
      console.error(error);
    }
  }
}

// 🔄 ФУНКЦИЯ АВТООБНОВЛЕНИЯ
async function updateCrack(): Promise<void> {
  // Цветовая палитра (как в start.sh)
  const colors = {
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m',
    BLUE: '\x1b[0;34m',
    PURPLE: '\x1b[0;35m',
    CYAN: '\x1b[0;36m',
    YELLOW: '\x1b[1;33m',
    BOLD: '\x1b[1m',
    DIM: '\x1b[2m',
    RESET: '\x1b[0m'
  };

  const tempDir = '.crtmp';
  const repoUrl = 'https://github.com/derxanax/crack.git';

  console.log('\n🔄 АВТООБНОВЛЕНИЕ CRACK\n');
  console.log(`${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
  console.log(`${colors.CYAN}║${colors.RESET}    🚀 ${colors.YELLOW}ОБНОВЛЕНИЕ С GITHUB${colors.RESET} 🚀    ${colors.CYAN}║${colors.RESET}`);
  console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);

  try {
    // 1. Проверка git
    console.log(`${colors.BLUE}🔍 ЭТАП 1/5: Проверка git${colors.RESET}`);
    try {
      execSync('git --version', { stdio: 'pipe' });
      console.log(`${colors.GREEN}✅ Git найден${colors.RESET}\n`);
    } catch {
      console.log(`${colors.RED}❌ Git не найден! Установите git${colors.RESET}`);
      return;
    }

    // 2. Создание временной папки
    console.log(`${colors.BLUE}📁 ЭТАП 2/5: Создание временной папки${colors.RESET}`);
    if (fs.existsSync(tempDir)) {
      console.log(`${colors.YELLOW}⚠️  Удаляю существующую папку ${tempDir}${colors.RESET}`);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);
    console.log(`${colors.GREEN}✅ Папка ${tempDir} создана${colors.RESET}\n`);

    // 3. Клонирование репозитория
    console.log(`${colors.BLUE}📦 ЭТАП 3/5: Скачивание с GitHub${colors.RESET}`);
    console.log(`${colors.DIM}Клонирую ${repoUrl}...${colors.RESET}`);
    
    try {
      execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'pipe' });
      console.log(`${colors.GREEN}✅ Репозиторий скачан${colors.RESET}\n`);
    } catch (error) {
      console.log(`${colors.RED}❌ Ошибка клонирования: ${error}${colors.RESET}`);
      return;
    }

    // 4. Запуск установки
    console.log(`${colors.BLUE}⚡ ЭТАП 4/5: Запуск установки${colors.RESET}`);
    console.log(`${colors.PURPLE}╔════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.PURPLE}║  ${colors.YELLOW}Запускаю start.sh${colors.RESET}         ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}╚════════════════════════════════╝${colors.RESET}`);

    try {
      // Переходим в папку и запускаем start.sh
      const installScript = path.join(tempDir, 'start.sh');
      
      if (fs.existsSync(installScript)) {
        // Делаем скрипт исполняемым
        execSync(`chmod +x ${installScript}`);
        
        // Запускаем установку из временной папки с правильной рабочей директорией
        execSync(`./start.sh --force`, { 
          stdio: 'inherit',
          cwd: tempDir  // Устанавливаем рабочую директорию в tempDir
        });
        console.log(`${colors.GREEN}✅ Установка завершена${colors.RESET}\n`);
      } else {
        console.log(`${colors.RED}❌ start.sh не найден в репозитории${colors.RESET}`);
        return;
      }
    } catch (error) {
      console.log(`${colors.RED}❌ Ошибка установки: ${error}${colors.RESET}`);
      return;
    }

    // 5. Очистка
    console.log(`${colors.BLUE}🗑️  ЭТАП 5/5: Очистка${colors.RESET}`);
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log(`${colors.GREEN}✅ Временные файлы удалены${colors.RESET}\n`);

    // Финальное сообщение
    console.log(`${colors.BOLD}${colors.GREEN}🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО! 🎉${colors.RESET}`);
    console.log(`${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}           🌟 ${colors.GREEN}CRACK ОБНОВЛЕН!${colors.RESET} 🌟         ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);

  } catch (error) {
    console.log(`${colors.RED}💥 КРИТИЧЕСКАЯ ОШИБКА ОБНОВЛЕНИЯ:${colors.RESET}`);
    console.error(error);
    
    // Очистка при ошибке
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`${colors.YELLOW}🧹 Временные файлы очищены${colors.RESET}`);
    }
  }
}

async function main(): Promise<void> {
  const interpreter = new CrackInterpreter();
  
  if (process.argv.length < 3) {
    interpreter.showLogo();
    console.log('Использование:');
    console.log('  crack <file.crack>  - запустить программу');
    console.log('  crack --upd         - обновить Crack с GitHub');
    return;
  }

  const argument = process.argv[2];
  
  // Обработка команды обновления
  if (argument === '--upd') {
    await updateCrack();
    return;
  }

  // Обычное выполнение файла
  await interpreter.run(argument);
}

if (require.main === module) {
  main();
}

export { CrackInterpreter, main }; 