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
exports.CrapmManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
class CrapmManager {
    constructor() {
        this.baseUrl = 'https://raw.githubusercontent.com/derxanax/crack/main/modules';
    }
    showLogo() {
        console.log(`
📦 CRAPM - Crack Package Manager 📦
  ➤ Управление модулями для языка Crack
`);
    }
    async install(moduleName) {
        console.log(`
📦 CRAPM - Crack Package Manager 📦
  ➤ Устанавливаем модуль ${moduleName}...
`);
        const moduleDir = path.join(process.cwd(), 'crack_modules', moduleName);
        if (!fs.existsSync(path.join(process.cwd(), 'crack_modules'))) {
            fs.mkdirSync(path.join(process.cwd(), 'crack_modules'), { recursive: true });
        }
        if (!fs.existsSync(moduleDir)) {
            fs.mkdirSync(moduleDir, { recursive: true });
            fs.mkdirSync(path.join(moduleDir, 'src'), { recursive: true });
        }
        try {
            await this.downloadFile(`${this.baseUrl}/${moduleName}/info.json`, path.join(moduleDir, 'info.json'));
            await this.downloadFile(`${this.baseUrl}/${moduleName}/package.json`, path.join(moduleDir, 'package.json'));
            await this.downloadFile(`${this.baseUrl}/${moduleName}/src/index.js`, path.join(moduleDir, 'src', 'index.js'));
            console.log(`✅ Модуль ${moduleName} успешно установлен!`);
            console.log(`📝 Используйте: imp ${moduleName}`);
        }
        catch (error) {
            console.log(`❌ Ошибка установки модуля ${moduleName}`);
            if (error.message.includes('404')) {
                console.log(`
🤔 Модуль "${moduleName}" не найден!

💡 Возможные причины:
  • Проверьте название модуля (возможно опечатка)
  • Модуль еще не создан
  • Используйте команду 'crapm list-available' для просмотра доступных модулей

📋 Популярные модули:
  • input  - Работа с пользовательским вводом
  • math   - Математические функции
  • string - Работа со строками
  • file   - Работа с файлами
`);
            }
            else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
                console.log(`
🌐 Проблема с сетевым соединением!

💡 Проверьте:
  • Подключение к интернету
  • Настройки прокси/фаервола
  • DNS настройки
`);
            }
            else {
                console.log(`
🔧 Техническая ошибка: ${error.message}

💡 Попробуйте:
  • Перезапустить команду
  • Проверить права доступа к папке
  • Освободить место на диске
`);
            }
            if (fs.existsSync(moduleDir)) {
                fs.rmSync(moduleDir, { recursive: true, force: true });
                console.log('🧹 Очистил поврежденные файлы модуля');
            }
        }
    }
    async listAvailable() {
        console.log(`
📦 CRAPM - Доступные модули для установки:
`);
        const availableModules = [
            { name: 'input', description: 'Работа с пользовательским вводом' },
            { name: 'math', description: 'Математические функции' },
            { name: 'string', description: 'Работа со строками' },
            { name: 'file', description: 'Работа с файлами' },
            { name: 'http', description: 'HTTP запросы и сервер' },
            { name: 'crypto', description: 'Криптографические функции' }
        ];
        availableModules.forEach(module => {
            console.log(`  📋 ${module.name.padEnd(10)} - ${module.description}`);
        });
        console.log(`
💡 Установка: crapm install <module_name>
🔍 Пример: crapm install input
`);
    }
    uninstall(moduleName) {
        const moduleDir = path.join(process.cwd(), 'crack_modules', moduleName);
        if (fs.existsSync(moduleDir)) {
            fs.rmSync(moduleDir, { recursive: true, force: true });
            console.log(`🗑️ Модуль ${moduleName} удален`);
        }
        else {
            console.log(`❌ Модуль ${moduleName} не найден`);
            console.log(`💡 Используйте 'crapm list' для просмотра установленных модулей`);
        }
    }
    list() {
        const modulesDir = path.join(process.cwd(), 'crack_modules');
        if (!fs.existsSync(modulesDir)) {
            console.log('📦 Установленных модулей нет');
            console.log('💡 Установите модуль: crapm install <module_name>');
            return;
        }
        const modules = fs.readdirSync(modulesDir);
        if (modules.length === 0) {
            console.log('📦 Установленных модулей нет');
            console.log('💡 Установите модуль: crapm install <module_name>');
        }
        else {
            console.log('📦 Установленные модули:');
            modules.forEach(module => {
                const infoPath = path.join(modulesDir, module, 'info.json');
                if (fs.existsSync(infoPath)) {
                    try {
                        const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
                        console.log(`  ✅ ${module} v${info.version} - ${info.description}`);
                    }
                    catch {
                        console.log(`  ⚠️ ${module} (поврежден info.json)`);
                    }
                }
                else {
                    console.log(`  ⚠️ ${module} (отсутствует info.json)`);
                }
            });
        }
    }
    downloadFile(url, filepath) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, (response) => {
                if (response.statusCode === 404) {
                    reject(new Error(`HTTP 404: Модуль не найден (${url})`));
                    return;
                }
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
                fileStream.on('error', (err) => {
                    fs.unlink(filepath, () => { });
                    reject(err);
                });
            });
            request.on('error', (err) => {
                reject(new Error(`Сетевая ошибка: ${err.message}`));
            });
            request.setTimeout(10000, () => {
                request.destroy();
                reject(new Error('Таймаут запроса (10 сек)'));
            });
        });
    }
}
exports.CrapmManager = CrapmManager;
function main() {
    const crapm = new CrapmManager();
    const args = process.argv.slice(2);
    if (args.length === 0) {
        crapm.showLogo();
        console.log(`
Команды:
  install <module>     - Установить модуль
  uninstall <module>   - Удалить модуль  
  list                 - Список установленных модулей
  list-available       - Список доступных модулей

Пример: crapm install input
`);
        return;
    }
    const command = args[0];
    const moduleName = args[1];
    switch (command) {
        case 'install':
            if (!moduleName) {
                console.log('❌ Укажите имя модуля для установки');
                console.log('💡 Пример: crapm install input');
                return;
            }
            crapm.install(moduleName);
            break;
        case 'uninstall':
            if (!moduleName) {
                console.log('❌ Укажите имя модуля для удаления');
                console.log('💡 Пример: crapm uninstall input');
                return;
            }
            crapm.uninstall(moduleName);
            break;
        case 'list':
            crapm.list();
            break;
        case 'list-available':
            crapm.listAvailable();
            break;
        default:
            console.log('❌ Неизвестная команда. Используйте: install, uninstall, list, list-available');
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=crapm.js.map