# 🧮 MATH Module для Crack

**Математический модуль для детей и новичков в языке программирования Crack!**

## 🎯 О модуле Math

**Math** - это базовый математический модуль, специально созданный для **детей и подростков**, изучающих программирование на языке Crack. Все функции просты, безопасны и с понятными названиями.

### 🌟 Философия модуля
- **🧒 Простая математика** - только основные операции
- **🔒 Безопасность** - защита от деления на ноль и ошибок
- **📚 Обучение** - каждая функция объясняет математику
- **🎨 Дружелюбность** - понятные названия и сообщения об ошибках

## 🚀 Быстрый старт

### 📦 Установка
```bash
# Установка через CRAPM
crapm install math
```

### 🎮 Первое использование
```crack
// Подключаем модуль
imp math

// Простое сложение
result = math.add(5, 3)
conlog "5 + 3 ="
conlog (result)
```

## 📚 Полный справочник функций

### 1. ➕ Сложение - `math.add(a, b)`

**Что делает:** Складывает два числа  
**Возвращает:** Сумму чисел a и b  

```crack
imp math

// Простые примеры
sum1 = math.add(2, 3)        // Результат: 5
sum2 = math.add(10, 15)      // Результат: 25
sum3 = math.add(0, 100)      // Результат: 100

conlog "2 + 3 ="
conlog (sum1)
conlog "10 + 15 ="
conlog (sum2)
```

### 2. ➖ Вычитание - `math.subtract(a, b)`

**Что делает:** Вычитает второе число из первого  
**Возвращает:** Разность a - b  

```crack
imp math

// Примеры вычитания
diff1 = math.subtract(10, 3)    // Результат: 7
diff2 = math.subtract(20, 5)    // Результат: 15
diff3 = math.subtract(5, 5)     // Результат: 0

conlog "10 - 3 ="
conlog (diff1)
conlog "20 - 5 ="
conlog (diff2)
```

### 3. ✖️ Умножение - `math.multiply(a, b)`

**Что делает:** Умножает два числа  
**Возвращает:** Произведение a * b  

```crack
imp math

// Примеры умножения
prod1 = math.multiply(4, 5)     // Результат: 20
prod2 = math.multiply(7, 8)     // Результат: 56
prod3 = math.multiply(12, 2)    // Результат: 24

conlog "4 * 5 ="
conlog (prod1)
conlog "7 * 8 ="
conlog (prod2)
```

### 4. ➗ Деление - `math.divide(a, b)`

**Что делает:** Делит первое число на второе  
**Возвращает:** Частное a / b  
**⚠️ Важно:** Защищено от деления на ноль!  

```crack
imp math

// Примеры деления
quot1 = math.divide(20, 4)      // Результат: 5
quot2 = math.divide(15, 3)      // Результат: 5
quot3 = math.divide(100, 10)    // Результат: 10

conlog "20 / 4 ="
conlog (quot1)
conlog "15 / 3 ="
conlog (quot2)

// Безопасное деление на ноль
safe = math.divide(10, 0)       // Выдаст ошибку, не сломает программу
```

### 5. 🔢 Возведение в степень - `math.power(base, exponent)`

**Что делает:** Возводит число в степень  
**Возвращает:** base в степени exponent  

```crack
imp math

// Примеры степеней
pow1 = math.power(2, 3)         // Результат: 8 (2³)
pow2 = math.power(5, 2)         // Результат: 25 (5²)
pow3 = math.power(10, 3)        // Результат: 1000 (10³)

conlog "2 в степени 3 ="
conlog (pow1)
conlog "5 в степени 2 ="
conlog (pow2)
```

### 6. √ Квадратный корень - `math.sqrt(number)`

**Что делает:** Извлекает квадратный корень  
**Возвращает:** Квадратный корень числа  
**⚠️ Важно:** Защищено от отрицательных чисел!  

```crack
imp math

// Примеры корней
sqrt1 = math.sqrt(9)            // Результат: 3
sqrt2 = math.sqrt(16)           // Результат: 4
sqrt3 = math.sqrt(25)           // Результат: 5

conlog "Корень из 9 ="
conlog (sqrt1)
conlog "Корень из 16 ="
conlog (sqrt2)

// Безопасный корень из отрицательного числа
safe = math.sqrt(-5)            // Выдаст ошибку, не сломает программу
```

### 7. 🎲 Случайные числа - `math.random(min, max)`

**Что делает:** Генерирует случайное целое число в диапазоне  
**Возвращает:** Случайное число от min до max включительно  
**⚠️ Важно:** Полезно для игр и обучения!  

```crack
imp math

// Примеры случайных чисел
dice = math.random(1, 6)         // Результат: от 1 до 6 (игральная кость)
lottery = math.random(1, 100)    // Результат: от 1 до 100
coin = math.random(0, 1)         // Результат: 0 или 1 (монетка)

conlog "Бросок кости:"
conlog (dice)
conlog "Лотерейный номер:"
conlog (lottery)
conlog "Монетка (0=орел, 1=решка):"
conlog (coin)
```

## 🧪 Примеры для разных возрастов

### 👶 Для начинающих (5-8 лет)
```crack
imp math

conlog "🧮 Учимся считать с роботом!"

// Простое сложение
cookies = math.add(3, 2)
conlog "У меня было 3 печенья, дали еще 2"
conlog "Стало печенек:"
conlog (cookies)

// Простое вычитание
apples = math.subtract(7, 3)
conlog "Было 7 яблок, съел 3"
conlog "Осталось яблок:"
conlog (apples)
```

### 🧒 Для детей (9-12 лет)
```crack
imp math

conlog "📐 Решаем задачи по математике!"

// Площадь прямоугольника
length = 8
width = 5
area = math.multiply(length, width)
conlog "Длина комнаты: 8 метров"
conlog "Ширина комнаты: 5 метров"  
conlog "Площадь комнаты:"
conlog (area)
conlog "квадратных метров"

// Деление поровну
candies = 24
children = 6
perChild = math.divide(candies, children)
conlog "24 конфеты поделили на 6 детей"
conlog "Каждому досталось:"
conlog (perChild)
conlog "конфет"
```

### 🎓 Для подростков (13+ лет)
```crack
imp math

conlog "🔬 Математические вычисления!"

// Вычисление площади круга (приблизительно)
radius = 5
pi = 3.14159
radiusSquared = math.power(radius, 2)
circleArea = math.multiply(pi, radiusSquared)

conlog "Радиус круга: 5"
conlog "Площадь круга (π * r²):"
conlog (circleArea)

// Вычисление гипотенузы (теорема Пифагора)
a = 3
b = 4
aSquared = math.power(a, 2)
bSquared = math.power(b, 2)
cSquared = math.add(aSquared, bSquared)
c = math.sqrt(cSquared)

conlog "Катеты треугольника: 3 и 4"
conlog "Гипотенуза:"
conlog (c)
```

## 🎮 Интерактивные проекты

### 🎯 Калькулятор для детей
```crack
imp math
imp input

conlog "🧮 Детский калькулятор на Crack!"

num1 = input.readNumber("Введите первое число: ")
num2 = input.readNumber("Введите второе число: ")

sum = math.add(num1, num2)
diff = math.subtract(num1, num2)
prod = math.multiply(num1, num2)
quot = math.divide(num1, num2)

conlog "📊 Результаты:"
conlog "Сумма:"
conlog (sum)
conlog "Разность:"
conlog (diff)
conlog "Произведение:"
conlog (prod)
conlog "Частное:"
conlog (quot)
```

### 🎲 Генератор случайных вычислений
```crack
imp math

conlog "🎲 Случайные математические примеры!"

// Используем разные числа для примеров
examples = 5
counter = 1

while (counter <= examples):
  // Простые примеры с фиксированными числами
  if (counter == 1):
    result = math.add(7, 3)
    conlog "7 + 3 ="
    conlog (result)
  
  if (counter == 2):
    result = math.multiply(6, 4)
    conlog "6 * 4 ="
    conlog (result)
    
  if (counter == 3):
    result = math.power(3, 2)
    conlog "3 в степени 2 ="
    conlog (result)
    
  if (counter == 4):
    result = math.sqrt(16)
    conlog "Корень из 16 ="
    conlog (result)
    
  if (counter == 5):
    result = math.divide(20, 4)
    conlog "20 / 4 ="
    conlog (result)
  
  counter = counter + 1
```

## 🔒 Безопасность для детей

### ✅ Защищенные функции
- **Деление на ноль** - выдает ошибку, не ломает программу
- **Отрицательный корень** - безопасная обработка ошибки
- **Проверка типов** - только числа принимаются
- **Понятные ошибки** - дружелюбные сообщения на русском

### 🛡️ Что не может сломаться
```crack
imp math

// Эти вызовы безопасны и не сломают программу
safe1 = math.divide(10, 0)      // Ошибка, но программа продолжится
safe2 = math.sqrt(-5)           // Ошибка, но программа продолжится  
// safe3 = math.add("hello", 5) // Ошибка типа, но безопасно
```

## 🔧 Технические детали

### 📋 Информация о модуле
- **Название:** crack-math-module
- **Версия:** 1.0.0
- **Автор:** derxanax
- **Лицензия:** MIT
- **Зависимости:** Нет (только JavaScript)

### 🏗️ Структура файлов
```
math/
├── README.md         # 📖 Эта документация
├── info.json         # ℹ️ Описание функций для Crack
├── package.json      # 📦 Метаданные модуля
└── src/
    └── index.js      # 🧮 Математические функции
```

### 🎫 Экспортируемые функции
```javascript
module.exports = {
  add,          // Сложение
  subtract,     // Вычитание  
  multiply,     // Умножение
  divide,       // Деление
  power,        // Степень
  sqrt          // Квадратный корень
};
```

## 🐛 Решение проблем

### ❓ Частые вопросы

**Q: Модуль math не найден**  
A: Установите через `crapm install math`

**Q: Ошибка "Деление на ноль"**  
A: Это нормально! Проверьте второй аргумент в `math.divide()`

**Q: Ошибка "Отрицательный корень"**  
A: Квадратный корень из отрицательных чисел невозможен

**Q: Функция возвращает неправильный результат**  
A: Проверьте, что передаете числа, а не строки

### 🔍 Примеры ошибок и решений

```crack
imp math

// ❌ Неправильно
bad1 = math.divide(10, 0)        // Ошибка деления на ноль
bad2 = math.sqrt(-4)             // Ошибка отрицательного корня

// ✅ Правильно  
good1 = math.divide(10, 2)       // Результат: 5
good2 = math.sqrt(4)             // Результат: 2
```

## 📚 Связанные модули

Рекомендуемые модули для изучения вместе с **math**:

- **📝 input** - Ввод чисел от пользователя
- **📄 string** - Работа с текстовыми результатами  
- **📁 file** - Сохранение вычислений в файлы

## 🎉 Заключение

Модуль **math** - это твой первый шаг в изучении программирования и математики! 

✨ **Помни:**
- Начинай с простых примеров
- Экспериментируй с разными числами
- Не бойся ошибок - они помогают учиться
- Создавай свои математические проекты

**🧮 Удачи в изучении математики с Crack! 🧮**

---

📄 **Лицензия:** MIT © 2024 derxanax  
🐧 **Системы:** Linux/macOS only  
🚫 **Windows:** Не поддерживается 