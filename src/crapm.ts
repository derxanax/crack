#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

class CrapmManager {
  private baseUrl = 'https://raw.githubusercontent.com/derxanax/crack/main/modules';

  showLogo(): void {
    console.log(`
📦 CRAPM - Crack Package Manager 📦
  ➤ Управление модулями для языка Crack
`);
  }

  async install(moduleName: string): Promise<void> {
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
    } catch (error: any) {
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
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        console.log(`
🌐 Проблема с сетевым соединением!

💡 Проверьте:
  • Подключение к интернету
  • Настройки прокси/фаервола
  • DNS настройки
`);
      } else {
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

  async listAvailable(): Promise<void> {
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

  uninstall(moduleName: string): void {
    const moduleDir = path.join(process.cwd(), 'crack_modules', moduleName);
    
    if (fs.existsSync(moduleDir)) {
      fs.rmSync(moduleDir, { recursive: true, force: true });
      console.log(`🗑️ Модуль ${moduleName} удален`);
    } else {
      console.log(`❌ Модуль ${moduleName} не найден`);
      console.log(`💡 Используйте 'crapm list' для просмотра установленных модулей`);
    }
  }

  list(): void {
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
    } else {
      console.log('📦 Установленные модули:');
      modules.forEach(module => {
        const infoPath = path.join(modulesDir, module, 'info.json');
        if (fs.existsSync(infoPath)) {
          try {
          const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          console.log(`  ✅ ${module} v${info.version} - ${info.description}`);
          } catch {
            console.log(`  ⚠️ ${module} (поврежден info.json)`);
          }
        } else {
          console.log(`  ⚠️ ${module} (отсутствует info.json)`);
        }
      });
    }
  }

  private downloadFile(url: string, filepath: string): Promise<void> {
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
          fs.unlink(filepath, () => {});
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

function main(): void {
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

export { CrapmManager }; 