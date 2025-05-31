# 🚀 Crack Programming Language

Современный интерпретируемый язык программирования с **пробельным синтаксисом** как в Python!

## ✨ Особенности

🐍 **Пробельный синтаксис** - отступы вместо фигурных скобок  
📦 **Модульная система** - легкое подключение модулей  
🤖 **ИИ-исправления** - автоматическое исправление ошибок  
🔧 **VSCode поддержка** - полное IDE с автодополнением  

## 📝 Синтаксис

### Основы
```crack
conlog "Hello, Crack!"
name = "World"
conlog (name)
```

### Условия (с отступами!)
```crack
x = 10
if (x > 5):
  conlog "x больше 5"
  result = x * 2
else:
  conlog "x меньше или равно 5"
```

### Циклы
```crack
i = 0
while (i < 3):
  conlog "Цикл while:"
  conlog (i)
  i = i + 1

for (j = 0; j < 5; j = j + 1):
  conlog "Цикл for:"
  conlog (j)
```

### Модули
```crack
imp input
name = input.readLine("Как вас зовут? ")
conlog (name)
```

## 🚀 Установка и запуск

### Клонирование
```bash
git clone https://github.com/derxanax/crack.git
cd crack
```

### Сборка
```bash
npm install
npm run build
```

### Запуск
```bash
# Прямой запуск
node dist/main.js test/indent_test.crack

# Или через бинарный файл
./crack test/indent_test.crack
```

## 📦 Управление модулями

### CRAPM - Crack Package Manager
```bash
# Установка модуля
node dist/crapm.js install input

# Список модулей
node dist/crapm.js list

# Доступные модули
node dist/crapm.js list-available
```

### Доступные модули:
- **input** - Пользовательский ввод (readline, confirm, choice)
- **math** - Математические функции  
- **string** - Работа со строками
- **file** - Файловые операции
- **http** - HTTP запросы
- **crypto** - Криптография

## 🎨 VSCode расширение

### Возможности:
- 🔥 **Динамическая загрузка модулей** из `modules/`
- 💡 **Умное автодополнение** функций модулей
- 🎨 **Подсветка синтаксиса** с поддержкой отступов
- 🔄 **Автообновление** при изменении `info.json`

### Установка:
```bash
cd vsc-crack
npm install
npm run compile
```

## 🧪 Примеры

### test/indent_test.crack
```crack
conlog "=== Тест пробельного синтаксиса ==="

x = 10
if (x > 5):
  conlog "x больше 5"
  y = x * 2
  conlog (y)

i = 0  
while (i < 3):
  conlog (i)
  i = i + 1
```

## 🤖 ИИ-помощник

При ошибках Crack может предложить автоматическое исправление через локальный ИИ API:

```bash
# Запустите ИИ API (опционально)
# Crack автоматически предложит исправления
```

## 🛠️ Структура проекта

```
crack/
├── src/main.ts          # Основной интерпретатор
├── src/crapm.ts         # Менеджер пакетов
├── test/               # Тестовые файлы
├── modules/            # Локальные модули
├── vsc-crack/          # VSCode расширение
└── dist/               # Скомпилированные файлы
```

## 📄 Лицензия

MIT License © 2024 derxanax

---

**🔥 Попробуйте Crack прямо сейчас!**

```bash
git clone https://github.com/derxanax/crack.git
cd crack && npm install && npm run build
echo 'conlog "Hello, Crack!"' > hello.crack
node dist/main.js hello.crack
``` 