#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as readline from 'readline';

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
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  NEWLINE = 'NEWLINE',
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

class AIFixProvider {
  private static API_URL = 'http://localhost:3700';
  
  static async checkApiStatus(): Promise<boolean> {
    console.log('🔍 Проверяю статус API на localhost:3700...');
    
    return new Promise((resolve) => {
      const req = http.get(`${this.API_URL}/api/status`, (res) => {
        console.log(`📡 Статус ответа API: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          console.log(`📥 Получен chunk статуса: ${chunk.length} байт`);
        });
        
        res.on('end', () => {
          console.log('📦 ОТВЕТ СТАТУСА API:');
          console.log(data);
          
          try {
            const status = JSON.parse(data);
            console.log('✅ Статус распарсен:', status);
            const isReady = status.status === 'ready';
            console.log(`🎯 API готов: ${isReady}`);
            resolve(isReady);
          } catch (parseError) {
            console.log('💥 ОШИБКА ПАРСИНГА СТАТУСА:', parseError);
            resolve(false);
          }
        });
      }).on('error', (err) => {
        console.log('🔥 ОШИБКА ЗАПРОСА СТАТУСА:', err);
        resolve(false);
      });
      
      req.setTimeout(3000, () => {
        console.log('⏰ ТАЙМАУТ проверки статуса (3 сек)');
        req.destroy();
        resolve(false);
      });
    });
  }
  
  static async fixCodeWithAI(code: string, error: string): Promise<string | null> {
    const prompt = `Ты эксперт по языку программирования Crack. Исправь ошибки в коде.

=== ПОЛНАЯ ДОКУМЕНТАЦИЯ ЯЗЫКА CRACK ===

КОМАНДЫ:
1. conlog "текст" - вывод строки на экран
2. conlog (переменная) - вывод значения переменной
3. переменная = значение - присваивание
4. codego:(переменная) - выполнение кода из переменной
5. imp модуль - импорт модуля
6. // текст // - комментарии (НЕ обычные //)

ПРАВИЛЬНЫЕ ПРИМЕРЫ:
conlog "Hello World"
name = "Crack"
conlog (name)
x = 5
y = x + 10
conlog (y)
code = "conlog \\"test\\""
codego:(code)
imp math

ЧАСТЫЕ ОШИБКИ И ИСПРАВЛЕНИЯ:

ОШИБКА: conlog (без аргументов)
ИСПРАВЛЕНИЕ: conlog "текст" или удалить строку

ОШИБКА: conlog (
ИСПРАВЛЕНИЕ: conlog ("текст") или conlog (переменная)

ОШИБКА: conlog )
ИСПРАВЛЕНИЕ: conlog ("текст")

ОШИБКА: conlog (несуществующая_переменная)
ИСПРАВЛЕНИЕ: создать переменную или изменить на conlog "текст"

ОШИБКА: codego (без аргументов)
ИСПРАВЛЕНИЕ: удалить строку или codego:(переменная)

ОШИБКА: codego:
ИСПРАВЛЕНИЕ: codego:(переменная)

ОШИБКА: codego:(
ИСПРАВЛЕНИЕ: codego:(переменная)

ОШИБКА: imp (без модуля)
ИСПРАВЛЕНИЕ: imp math или удалить строку

ОШИБКА: незакрытые кавычки
ИСПРАВЛЕНИЕ: добавить закрывающие кавычки

УСЛОВИЯ И ЦИКЛЫ:
8. if (условие) { код } - условное выполнение
9. else { код } - альтернативный блок
10. while (условие) { код } - цикл while
11. for (i = 0; i < 10; i = i + 1) { код } - цикл for

ОПЕРАТОРЫ СРАВНЕНИЯ:
==, !=, >, <, >=, <=

ПРАВИЛЬНЫЕ ПРИМЕРЫ ЦИКЛОВ:
x = 5
if (x > 3) {
  conlog "x больше 3"
} else {
  conlog "x меньше или равно 3" 
}

i = 0
while (i < 5) {
  conlog (i)
  i = i + 1
}

for (j = 0; j < 3; j = j + 1) {
  conlog "Итерация"
  conlog (j)
}

ВАЖНО:
- Удаляй комментарии и случайный текст
- Исправляй синтаксические ошибки
- Сохраняй только рабочий код
- НЕ добавляй пустые аргументы типа conlog ""
- Используй { } для блоков кода в if/while/for

ТЕКУЩАЯ ОШИБКА: ${error}

ИСХОДНЫЙ КОД:
${code}

Дай в ответе ТОЛЬКО исправленный чистый код без комментариев и мусора, код должен работать без ошибок:`;

    console.log('📤 ОТПРАВЛЯЮ ПРОМПТ ИИ:');
    console.log('═'.repeat(50));
    console.log(prompt);
    console.log('═'.repeat(50));

    return new Promise((resolve) => {
      const postData = JSON.stringify({ message: prompt });
      
      console.log('🌐 Подключаюсь к API localhost:3700...');
      
      const options = {
        hostname: 'localhost',
        port: 3700,
        path: '/api/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`📡 Статус ответа: ${res.statusCode}`);
        console.log(`📋 Заголовки: ${JSON.stringify(res.headers)}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          console.log(`📥 Получен chunk: ${chunk.length} байт`);
        });
        
        res.on('end', () => {
          console.log('📦 ПОЛНЫЙ ОТВЕТ ОТ API:');
          console.log('═'.repeat(50));
          console.log(data);
          console.log('═'.repeat(50));
          
          try {
            const response = JSON.parse(data);
            console.log('✅ JSON успешно распарсен');
            console.log('🔍 response.success:', response.success);
            console.log('📝 response.response:', response.response);
            
            if (response.success && response.response) {
              const fixedCode = response.response.trim();
              console.log('✨ ИСПРАВЛЕННЫЙ КОД:');
              console.log('═'.repeat(50));
              console.log(fixedCode);
              console.log('═'.repeat(50));
              resolve(fixedCode);
            } else {
              console.log('❌ Ошибка: response.success=false или пустой response.response');
              resolve(null);
            }
          } catch (parseError) {
            console.log('💥 ОШИБКА ПАРСИНГА JSON:', parseError);
            console.log('📄 Сырые данные:', data);
            resolve(null);
          }
        });
      });
      
      req.on('error', (err) => {
        console.log('🔥 ОШИБКА HTTP ЗАПРОСА:', err);
        resolve(null);
      });
      
      // Убираем таймаут - даем ИИ сколько угодно времени
      // req.setTimeout(30000, () => {
      //   console.log('⏰ ТАЙМАУТ запроса (30 сек)');
      //   req.destroy();
      //   resolve(null);
      // });
      
      console.log('📤 Отправляю данные...');
      req.write(postData);
      req.end();
    });
  }
}

class ErrorHandler {
  static async showCriticalError(message: string, line: number, suggestion: string, code?: string, filename?: string): Promise<void> {
    console.log(`
🚨 КРИТИЧЕСКАЯ ОШИБКА (строка ${line}) 🚨
╔════════════════════════════════════╗
║ ${message.padEnd(34)} ║
╚════════════════════════════════════╝
💡 СОВЕТ: ${suggestion}
`);
    
    if (code && filename) {
      console.log(`🤖 БЕТА И ОПАСНАЯ ФУНКЦИЯ: Исправить через ИИ? (y/n)`);
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
             rl.question('', async (answer) => {
         rl.close();
         
         if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'да') {
           console.log('🔄 Проверяю API...');
           
           const apiReady = await AIFixProvider.checkApiStatus();
           if (!apiReady) {
             console.log('❌ API не готов. Запустите API сервер сначала.');
             process.exit(1);
           }
           
           console.log('🤖 Отправляю код на исправление...');
           
           const fixedCode = await AIFixProvider.fixCodeWithAI(code, message);
           if (fixedCode) {
             fs.writeFileSync(filename, fixedCode, 'utf-8');
             console.log(`✅ Код исправлен и сохранен в ${filename}`);
             console.log('🔄 Перезапустите программу для проверки.');
           } else {
             console.log('❌ Не удалось получить исправленный код от ИИ.');
           }
         }
         process.exit(0);
       });
    }
  }

  static showWarning(message: string, line: number, token: string): void {
    console.log(`⚠️  ПРЕДУПРЕЖДЕНИЕ (строка ${line}): ${message} '${token}'`);
  }

  static showUnknownToken(token: string, line: number): void {
    console.log(`⚠️  Неизвестный токен на строке ${line}: '${token}'`);
  }
}

const KEYWORDS = ['conlog', 'imp', 'codego', 'if', 'else', 'while', 'for'];
const OPERATORS = ['+', '-', '*', '/', '=', '.', '?', '#'];
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
      
      if (line.trim() === '') continue;
      
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
            ErrorHandler.showCriticalError(
              'Незакрытая строка', 
              startLine, 
              'Добавьте закрывающую кавычку "');
            tokens.push({ type: TokenType.STRING, value, line: startLine });
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

      if (char === ':') {
        tokens.push({ type: TokenType.OPERATOR, value: char, line: lineNumber });
        current++;
        continue;
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

      let unknownValue = '';
      while (current < trimmedLine.length && !/[\s\n]/.test(trimmedLine[current])) {
        unknownValue += trimmedLine[current];
      current++;
      }
      
      if (unknownValue) {
        ErrorHandler.showUnknownToken(unknownValue, lineNumber);
        tokens.push({ type: TokenType.UNKNOWN, value: unknownValue, line: lineNumber });
      }
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', line: lineNumber });
    return tokens;
  }

  async parse(tokens: Token[]): Promise<ASTNode[]> {
    const ast: ASTNode[] = [];
    let current = 0;

    while (current < tokens.length && tokens[current].type !== TokenType.EOF) {
      const token = tokens[current];

      if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
        current++;
        const nextToken = tokens[current];
        
        if (!nextToken || nextToken.type === TokenType.EOF) {
          const originalCode = fs.readFileSync(this.currentFilename, 'utf-8');
          await ErrorHandler.showCriticalError(
            'Команда conlog требует аргумент',
            token.line,
            'Используйте: conlog "текст" или conlog (переменная)',
            originalCode,
            this.currentFilename
          );
          return ast;
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
            ErrorHandler.showCriticalError(
              'Неправильный синтаксис conlog',
              token.line,
              'Используйте: conlog (имя_переменной)'
            );
            current++;
            continue;
          }
          
          current++;
          const closeToken = tokens[current];
          
          if (!closeToken || closeToken.value !== ')') {
            ErrorHandler.showCriticalError(
              'Незакрытая скобка в conlog',
              token.line,
              'Добавьте закрывающую скобку )'
            );
          } else {
            if (!this.variables.has(varToken.value)) {
              ErrorHandler.showWarning(
                'Переменная не определена',
                varToken.line,
                varToken.value
              );
            }
            
            ast.push({
              type: 'FunctionCall', 
              name: 'conlog',
              args: [{ type: 'Variable', name: varToken.value }]
            });
            current++;
          }
        } else {
          const originalCode = fs.readFileSync(this.currentFilename, 'utf-8');
          await ErrorHandler.showCriticalError(
            'Неправильный аргумент для conlog',
            nextToken.line,
            'Используйте: conlog "строка" или conlog (переменная)',
            originalCode,
            this.currentFilename
          );
          return ast;
        }
      } else if (token.type === TokenType.IDENTIFIER) {
        const nextToken = tokens[current + 1];
        if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
          current += 2;
          const valueToken = tokens[current];
          
          if (!valueToken) {
            ErrorHandler.showCriticalError(
              'Неполное присваивание переменной',
              token.line,
              'Добавьте значение после знака ='
            );
            break;
          }
          
          if (valueToken.type === TokenType.NUMBER) {
            ast.push({
              type: 'VariableAssignment',
              name: token.value,
              value: { type: 'Number', value: parseInt(valueToken.value) }
            });
            current++;
          } else if (valueToken.type === TokenType.STRING) {
            ast.push({
              type: 'VariableAssignment', 
              name: token.value,
              value: { type: 'String', value: valueToken.value }
            });
            current++;
          } else {
            let expression = '';
            while (current < tokens.length && tokens[current].type !== TokenType.EOF) {
              if (tokens[current].type === TokenType.KEYWORD) break;
              expression += tokens[current].value + ' ';
              current++;
            }
            ast.push({
              type: 'VariableAssignment',
              name: token.value, 
              value: { type: 'Expression', expression: expression.trim() }
            });
          }
        } else {
          ErrorHandler.showWarning(
            'Неопознанная конструкция',
            token.line,
            token.value
          );
          current++;
        }
      } else if (token.type === TokenType.KEYWORD && token.value === 'codego') {
        current++;
        const colonToken = tokens[current];
        
        if (!colonToken || colonToken.value !== ':') {
          ErrorHandler.showCriticalError(
            'Неправильный синтаксис codego',
            token.line,
            'Используйте: codego:(имя_переменной)'
          );
          current++;
          continue;
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
          ErrorHandler.showCriticalError(
            'Команда imp требует имя модуля',
            token.line,
            'Используйте: imp имя_модуля'
          );
          current++;
          continue;
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
      } else if (token.type === TokenType.UNKNOWN) {
        current++;
      } else {
        ErrorHandler.showWarning(
          'Неопознанный токен',
          token.line,
          token.value
        );
        current++;
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
        'Используйте: if (условие):'
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
    
    if (!tokens[current] || tokens[current].value !== ':') {
      ErrorHandler.showCriticalError(
        'Ожидается : после условия',
        tokens[start].line,
        'Используйте: if (условие):'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после :',
        tokens[start].line,
        'Сделайте отступ для блока кода'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    const body = await this.parseIndentedBlock(tokens, current);
    current = body.newPosition;
    
    let elseBody = null;
    if (tokens[current] && tokens[current].type === TokenType.KEYWORD && tokens[current].value === 'else') {
      current++;
      if (!tokens[current] || tokens[current].value !== ':') {
        ErrorHandler.showCriticalError(
          'Ожидается : после else',
          tokens[current-1].line,
          'Используйте: else:'
        );
        return { node: null, newPosition: current };
      }
      
      current++;
      
      if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
        ErrorHandler.showCriticalError(
          'Ожидается отступ после else:',
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
        'Используйте: while (условие):'
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
    
    if (!tokens[current] || tokens[current].value !== ':') {
      ErrorHandler.showCriticalError(
        'Ожидается : после условия',
        tokens[start].line,
        'Используйте: while (условие):'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после :',
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
        'Используйте: for (i = 0; i < 10; i = i + 1) { код }'
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
    
    if (!tokens[current] || tokens[current].value !== ':') {
      ErrorHandler.showCriticalError(
        'Ожидается : после for',
        tokens[start].line,
        'Используйте: for (...):'
      );
      return { node: null, newPosition: current };
    }
    
    current++;
    
    if (!tokens[current] || tokens[current].type !== TokenType.INDENT) {
      ErrorHandler.showCriticalError(
        'Ожидается отступ после :',
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
    let leftSide = '';
    
    while (current < tokens.length && 
           tokens[current].type !== TokenType.COMPARISON && 
           tokens[current].value !== ')' && 
           tokens[current].value !== ';') {
      leftSide += tokens[current].value + ' ';
      current++;
    }
    
    if (current >= tokens.length || tokens[current].type !== TokenType.COMPARISON) {
      return {
        condition: { left: leftSide.trim(), operator: '==', right: 'true' },
        newPosition: current
      };
    }
    
    const operator = tokens[current].value;
    current++;
    
    let rightSide = '';
    while (current < tokens.length && 
           tokens[current].value !== ')' && 
           tokens[current].value !== ';') {
      rightSide += tokens[current].value + ' ';
      current++;
    }
    
    return {
      condition: {
        left: leftSide.trim(),
        operator: operator,
        right: rightSide.trim()
      },
      newPosition: current
    };
  }

  async parseIndentedBlock(tokens: Token[], start: number): Promise<{body: ASTNode[], newPosition: number}> {
    const body: ASTNode[] = [];
    let current = start;
    
    while (current < tokens.length && tokens[current].type !== TokenType.DEDENT && tokens[current].type !== TokenType.EOF) {
      const token = tokens[current];
      
      if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
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
            } else {
              let expression = '';
              while (current < tokens.length && tokens[current].type !== TokenType.DEDENT && tokens[current].type !== TokenType.KEYWORD) {
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
        } else {
          current++;
        }
      } else {
        current++;
      }
    }
    
    return { body, newPosition: current };
  }

  async parseBlock(tokens: Token[], start: number): Promise<{body: ASTNode[], newPosition: number}> {
    const body: ASTNode[] = [];
    let current = start;
    
    while (current < tokens.length && tokens[current].value !== '}') {
      const token = tokens[current];
      
      if (token.type === TokenType.KEYWORD && token.value === 'conlog') {
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
      } else if (token.type === TokenType.IDENTIFIER) {
        const nextToken = tokens[current + 1];
        if (nextToken && nextToken.type === TokenType.OPERATOR && nextToken.value === '=') {
          current += 2;
          const valueToken = tokens[current];
          
          if (valueToken) {
            if (valueToken.type === TokenType.NUMBER && (current + 1 >= tokens.length || 
                tokens[current + 1].value === '}' || tokens[current + 1].type === TokenType.KEYWORD)) {
              body.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'Number', value: parseInt(valueToken.value) }
              });
              current++;
            } else if (valueToken.type === TokenType.STRING && (current + 1 >= tokens.length || 
                      tokens[current + 1].value === '}' || tokens[current + 1].type === TokenType.KEYWORD)) {
              body.push({
                type: 'VariableAssignment',
                name: token.value,
                value: { type: 'String', value: valueToken.value }
              });
              current++;
            } else {
              let expression = '';
              while (current < tokens.length && tokens[current].value !== '}' && tokens[current].type !== TokenType.KEYWORD) {
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
        } else {
          current++;
        }
      } else {
        current++;
      }
    }
    
    return { body, newPosition: current };
  }

  async execute(ast: ASTNode[]): Promise<void> {
    for (const node of ast) {
      switch (node.type) {
        case 'FunctionCall':
          if (node.name === 'conlog') {
            if (node.args[0].type === 'String') {
              console.log(node.args[0].value);
            } else if (node.args[0].type === 'Variable') {
              const value = this.variables.get(node.args[0].name);
              console.log(value !== undefined ? value : 'undefined');
            }
          }
          break;

        case 'VariableAssignment':
          if (node.value.type === 'Number') {
            this.variables.set(node.name, node.value.value);
          } else if (node.value.type === 'String') {
            this.variables.set(node.name, node.value.value);
          } else if (node.value.type === 'Expression') {
            const result = this.evaluateExpression(node.value.expression);
            this.variables.set(node.name, result);
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

  resolveValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value))) return Number(value);
    if (this.variables.has(value)) return this.variables.get(value);
    return value;
  }

  evaluateExpression(expr: string): number {
    try {
      let processedExpr = expr;
      
      this.variables.forEach((varValue, varName) => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        processedExpr = processedExpr.replace(regex, String(varValue));
      });
      
      const cleanExpr = processedExpr.replace(/[^0-9+\-*/.() ]/g, '');
      return eval(cleanExpr);
    } catch {
      return 0;
    }
  }

  loadModule(moduleName: string): void {
    try {
      const modulePath = path.join(process.cwd(), 'crack_modules', moduleName, 'src', 'index.js');
      if (fs.existsSync(modulePath)) {
        const moduleExports = require(modulePath);
        this.modules.set(moduleName, moduleExports);
        console.log(`✅ Модуль ${moduleName} загружен`);
      } else {
        console.log(`❌ Модуль ${moduleName} не найден`);
      }
    } catch (error) {
      console.log(`❌ Ошибка загрузки модуля ${moduleName}`);
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
      console.log(`
❌ ОШИБКА СИНТАКСИСА ❌
╔════════════════════╗
║   Проверь код!     ║
╚════════════════════╝
`);
      console.error(error);
    }
  }
}

async function main(): Promise<void> {
  const interpreter = new CrackInterpreter();
  
  if (process.argv.length < 3) {
    interpreter.showLogo();
    console.log('Использование: crack <file.crack>');
    return;
  }

  const filename = process.argv[2];
  await interpreter.run(filename);
}

if (require.main === module) {
  main();
}

export { CrackInterpreter, main }; 