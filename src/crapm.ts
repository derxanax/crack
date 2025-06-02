#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 🎨 ЦВЕТОВАЯ ПАЛИТРА
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

// ⚡ КРАСИВЫЙ СПИННЕР
function spinner(message: string, duration: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${colors.CYAN}${frames[frameIndex]} ${message}${colors.RESET}`);
      frameIndex = (frameIndex + 1) % frames.length;
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write(`\r${colors.GREEN}✅ ${message} - готово!${colors.RESET}\n`);
      resolve();
    }, duration);
  });
}

// 📊 ПРОГРЕСС-БАР
function progressBar(current: number, total: number, label: string): void {
  const width = 30;
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = `${colors.GREEN}${'█'.repeat(filled)}${colors.DIM}${'░'.repeat(empty)}${colors.RESET}`;
  process.stdout.write(`\r${colors.CYAN}[${bar}${colors.CYAN}] ${colors.YELLOW}${percentage}%${colors.RESET} ${label}`);
  
  if (current === total) {
    console.log('');
  }
}

class CrapmManager {
  private baseUrl = 'https://raw.githubusercontent.com/derxanax/crack/main/modules';

  showLogo(): void {
    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}     📦 ${colors.YELLOW}CRAPM${colors.RESET} - ${colors.GREEN}Package Manager${colors.RESET}     ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}    ${colors.DIM}Управление модулями для Crack${colors.RESET}     ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);
  }

  async install(moduleName: string): Promise<void> {
    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}     📦 ${colors.YELLOW}УСТАНОВКА МОДУЛЯ${colors.RESET} 📦        ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}        ${colors.GREEN}${moduleName}${colors.RESET}                     ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);

    const moduleDir = path.join(process.cwd(), 'crack_modules', moduleName);
    
    // 📁 Создание папок
    console.log(`${colors.BLUE}📁 ЭТАП 1/4: Подготовка папок${colors.RESET}`);
    if (!fs.existsSync(path.join(process.cwd(), 'crack_modules'))) {
      fs.mkdirSync(path.join(process.cwd(), 'crack_modules'), { recursive: true });
    }

    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
      fs.mkdirSync(path.join(moduleDir, 'src'), { recursive: true });
    }
    await spinner('Создаю структуру папок', 500);

    try {
      // 📦 Скачивание файлов
      console.log(`${colors.BLUE}📦 ЭТАП 2/4: Скачивание файлов${colors.RESET}`);
      
      progressBar(1, 3, 'info.json');
      await this.downloadFile(`${this.baseUrl}/${moduleName}/info.json`, path.join(moduleDir, 'info.json'));
      
      progressBar(2, 3, 'package.json');
      await this.downloadFile(`${this.baseUrl}/${moduleName}/package.json`, path.join(moduleDir, 'package.json'));
      
      progressBar(3, 3, 'index.js');
      await this.downloadFile(`${this.baseUrl}/${moduleName}/src/index.js`, path.join(moduleDir, 'src', 'index.js'));
      
      console.log(`${colors.GREEN}✅ Файлы модуля ${moduleName} скачаны${colors.RESET}\n`);
      
      // 🔧 Автоматическая установка npm зависимостей
      console.log(`${colors.BLUE}🔧 ЭТАП 3/4: npm зависимости${colors.RESET}`);
      await this.installNpmDependencies(moduleDir, moduleName);
      
      // 🔗 Проверяем зависимости от других Crack модулей
      console.log(`${colors.BLUE}🔗 ЭТАП 4/4: Crack зависимости${colors.RESET}`);
      await this.installCrackDependencies(moduleName);
      
      // 🎉 Успешное завершение
      console.log(`${colors.BOLD}${colors.GREEN}🎉 МОДУЛЬ УСТАНОВЛЕН УСПЕШНО! 🎉${colors.RESET}`);
      console.log(`${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
      console.log(`${colors.CYAN}║${colors.RESET}        📝 ${colors.YELLOW}Используйте: imp ${moduleName}${colors.RESET}      ${colors.CYAN}║${colors.RESET}`);
      console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);
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

  private async installNpmDependencies(moduleDir: string, moduleName: string): Promise<void> {
    try {
      const packageJsonPath = path.join(moduleDir, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        console.log(`${colors.YELLOW}⚠️ package.json не найден${colors.RESET}`);
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
        console.log(`${colors.GREEN}✅ npm зависимости не требуются${colors.RESET}\n`);
        return;
      }

      console.log(`${colors.DIM}📋 Зависимости: ${Object.keys(packageJson.dependencies).join(', ')}${colors.RESET}`);
      await spinner('Устанавливаю npm зависимости', 2000);

      const { stdout, stderr } = await execAsync('npm install', { cwd: moduleDir });
      
      if (stderr && !stderr.includes('npm WARN')) {
        console.log(`${colors.YELLOW}⚠️ Предупреждения: ${stderr}${colors.RESET}`);
      }
      
      console.log(`${colors.GREEN}✅ npm зависимости установлены${colors.RESET}\n`);
      
    } catch (error: any) {
      console.log(`${colors.RED}❌ Ошибка npm зависимостей:${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 ${error.message}${colors.RESET}`);
      console.log(`${colors.DIM}🔧 Попробуйте: cd crack_modules/${moduleName} && npm install${colors.RESET}\n`);
    }
  }

  private async installCrackDependencies(moduleName: string): Promise<void> {
    try {
      const infoJsonPath = path.join(process.cwd(), 'crack_modules', moduleName, 'info.json');
      
      if (!fs.existsSync(infoJsonPath)) {
        return;
      }

      const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, 'utf-8'));
      
      // Проверяем если есть поле dependencies в info.json
      if (!infoJson.dependencies || infoJson.dependencies.length === 0) {
        console.log(`${colors.GREEN}✅ Crack зависимости не требуются${colors.RESET}\n`);
        return;
      }

      console.log(`${colors.DIM}📋 Требуемые модули: ${infoJson.dependencies.join(', ')}${colors.RESET}`);

      for (const dependency of infoJson.dependencies) {
        const dependencyDir = path.join(process.cwd(), 'crack_modules', dependency);
        
        if (fs.existsSync(dependencyDir)) {
          console.log(`${colors.GREEN}✅ ${dependency} уже установлен${colors.RESET}`);
          continue;
        }
        
        console.log(`${colors.YELLOW}📥 Устанавливаю зависимость: ${dependency}${colors.RESET}`);
        await this.install(dependency);
      }
      
      console.log(`${colors.GREEN}✅ Все Crack зависимости установлены${colors.RESET}\n`);
      
    } catch (error: any) {
      console.log(`${colors.RED}❌ Ошибка Crack зависимостей:${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 ${error.message}${colors.RESET}\n`);
    }
  }

  async listAvailable(): Promise<void> {
    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}       📋 ${colors.YELLOW}ДОСТУПНЫЕ МОДУЛИ${colors.RESET} 📋        ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);

    try {
      // Читаем список модулей из файла
      const listModPath = path.join(__dirname, '..', 'modules', 'listmod.json');
      
      if (!fs.existsSync(listModPath)) {
        console.log(`${colors.RED}❌ Файл listmod.json не найден${colors.RESET}`);
        console.log(`${colors.YELLOW}💡 Используется резервный список модулей${colors.RESET}\n`);
        
        // Резервный список если файл не найден
        const fallbackModules = [
          { name: 'input', description: 'Работа с пользовательским вводом' },
          { name: 'math', description: 'Математические функции' }
        ];
        
        fallbackModules.forEach(module => {
          console.log(`  ${colors.GREEN}📋 ${colors.BOLD}${module.name.padEnd(10)}${colors.RESET} ${colors.DIM}- ${module.description}${colors.RESET}`);
        });
      } else {
        const modulesList = JSON.parse(fs.readFileSync(listModPath, 'utf-8'));
        
        if (!modulesList.modules || !Array.isArray(modulesList.modules)) {
          throw new Error('Неверный формат listmod.json');
        }
        
        modulesList.modules.forEach((module: any) => {
          console.log(`  ${colors.GREEN}📋 ${colors.BOLD}${module.name.padEnd(10)}${colors.RESET} ${colors.DIM}- ${module.description}${colors.RESET}`);
        });
      }
    } catch (error: any) {
      console.log(`${colors.RED}❌ Ошибка чтения списка модулей: ${error.message}${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 Проверьте файл modules/listmod.json${colors.RESET}\n`);
      return;
    }

    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET} ${colors.YELLOW}💡 Установка:${colors.RESET} crapm install <module>  ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET} ${colors.GREEN}🔍 Пример:${colors.RESET} crapm install input      ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET} ${colors.PURPLE}🚀 Автоустановка всех зависимостей!${colors.RESET}    ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);
  }

  uninstall(moduleName: string): void {
    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}        🗑️  ${colors.RED}УДАЛЕНИЕ МОДУЛЯ${colors.RESET} 🗑️         ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}            ${colors.YELLOW}${moduleName}${colors.RESET}                   ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);
    
    const moduleDir = path.join(process.cwd(), 'crack_modules', moduleName);
    
    if (fs.existsSync(moduleDir)) {
      fs.rmSync(moduleDir, { recursive: true, force: true });
      console.log(`${colors.GREEN}✅ Модуль ${moduleName} успешно удален${colors.RESET}\n`);
    } else {
      console.log(`${colors.RED}❌ Модуль ${moduleName} не найден${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 Используйте 'crapm list' для просмотра установленных модулей${colors.RESET}\n`);
    }
  }

  list(): void {
    console.log(`\n${colors.CYAN}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.CYAN}║${colors.RESET}      📦 ${colors.YELLOW}УСТАНОВЛЕННЫЕ МОДУЛИ${colors.RESET} 📦      ${colors.CYAN}║${colors.RESET}`);
    console.log(`${colors.CYAN}╚══════════════════════════════════════════╝${colors.RESET}\n`);
    
    const modulesDir = path.join(process.cwd(), 'crack_modules');
    
    if (!fs.existsSync(modulesDir)) {
      console.log(`${colors.DIM}📦 Установленных модулей нет${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 Установите модуль: crapm install <module_name>${colors.RESET}\n`);
      return;
    }

    const modules = fs.readdirSync(modulesDir);
    
    if (modules.length === 0) {
      console.log(`${colors.DIM}📦 Установленных модулей нет${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 Установите модуль: crapm install <module_name>${colors.RESET}\n`);
    } else {
      modules.forEach(module => {
        const infoPath = path.join(modulesDir, module, 'info.json');
        if (fs.existsSync(infoPath)) {
          try {
          const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          console.log(`  ${colors.GREEN}✅ ${colors.BOLD}${module}${colors.RESET} ${colors.CYAN}v${info.version}${colors.RESET} ${colors.DIM}- ${info.description}${colors.RESET}`);
          } catch {
            console.log(`  ${colors.YELLOW}⚠️ ${module} (поврежден info.json)${colors.RESET}`);
          }
        } else {
          console.log(`  ${colors.YELLOW}⚠️ ${module} (отсутствует info.json)${colors.RESET}`);
        }
      });
      console.log('');
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
    console.log(`${colors.PURPLE}╔══════════════════════════════════════════╗${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET}               ${colors.YELLOW}КОМАНДЫ${colors.RESET}                ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}╠══════════════════════════════════════════╣${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.GREEN}install <module>${colors.RESET}     - Установить модуль   ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.RED}uninstall <module>${colors.RESET}   - Удалить модуль     ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.BLUE}list${colors.RESET}                - Список установленных ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.CYAN}list-available${colors.RESET}      - Список доступных    ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}╠══════════════════════════════════════════╣${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.YELLOW}💡 Пример:${colors.RESET} crapm install input       ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}║${colors.RESET} ${colors.PURPLE}🚀 Автоустановка всех зависимостей!${colors.RESET}      ${colors.PURPLE}║${colors.RESET}`);
    console.log(`${colors.PURPLE}╚══════════════════════════════════════════╝${colors.RESET}\n`);
    return;
  }

  const command = args[0];
  const moduleName = args[1];

  switch (command) {
    case 'install':
      if (!moduleName) {
        console.log(`${colors.RED}❌ Укажите имя модуля для установки${colors.RESET}`);
        console.log(`${colors.YELLOW}💡 Пример: crapm install input${colors.RESET}\n`);
        return;
      }
      crapm.install(moduleName);
      break;

    case 'uninstall':
      if (!moduleName) {
        console.log(`${colors.RED}❌ Укажите имя модуля для удаления${colors.RESET}`);
        console.log(`${colors.YELLOW}💡 Пример: crapm uninstall input${colors.RESET}\n`);
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
      console.log(`${colors.RED}❌ Неизвестная команда${colors.RESET}`);
      console.log(`${colors.YELLOW}💡 Используйте: install, uninstall, list, list-available${colors.RESET}\n`);
  }
}

if (require.main === module) {
  main();
}

export { CrapmManager }; 