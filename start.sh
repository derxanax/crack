
#!/bin/bash

echo "
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♥          УСТАНАВЛИВАЕМ           ♥
♥           C R A C K              ♥
♥      Programming Language        ♥
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
"

echo "🔧 Установка зависимостей..."
npm install

echo "
⚡ КОМПИЛИРУЕМ КОД ⚡
╔════════════════════╗
║   TypeScript       ║
║        ↓           ║
║   JavaScript       ║
╚════════════════════╝
"

npm run build

if [ $? -eq 0 ]; then
    echo "
✅ КОМПИЛЯЦИЯ УСПЕШНА ✅
╔══════════════════════╗
║  Код готов к работе! ║
╚══════════════════════╝
"
else
    echo "
❌ ОШИБКА КОМПИЛЯЦИИ ❌
╔════════════════════╗
║   Проверь код!     ║
╚════════════════════╝
"
    exit 1
fi

echo "📦 Установка глобально..."
sudo npm install -g .

echo "🔗 Создание симлинков..."
sudo chmod +x /usr/local/lib/node_modules/crack/dist/main.js
sudo chmod +x /usr/local/lib/node_modules/crack/dist/crapm.js

echo "
🚀 УСТАНОВКА ЗАВЕРШЕНА 🚀
╔════════════════════════╗
║   crack - готов!       ║
║   crapm - готов!       ║
╚════════════════════════╝

Использование:
  crack hello.crack
  crapm install math

"

cat drel2.txt 