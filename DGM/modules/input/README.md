# 📝 INPUT Module для Crack

Модуль для обработки пользовательского ввода в языке программирования Crack.

## 🚀 Установка

```bash
crapm install input
```

## 📖 Использование в Crack

```crack
imp input
```

## 🔧 Функции

### readLine(prompt)
Считывает строку с консоли
```crack
imp input
name = input.readLine("Введите ваше имя: ")
conlog (name)
```

### readNumber(prompt)
Считывает число с валидацией
```crack
imp input
age = input.readNumber("Введите ваш возраст: ")
conlog (age)
```

### readPassword(prompt)
Считывает пароль (скрывает символы)
```crack
imp input
password = input.readPassword("Введите пароль: ")
```

### confirm(message)
Запрашивает подтверждение (да/нет)
```crack
imp input
result = input.confirm("Вы уверены?")
if (result) {
  conlog "Пользователь подтвердил"
} else {
  conlog "Пользователь отменил"
}
```

### choice(message, options)
Предлагает выбор из списка
```crack
imp input
options = ["Вариант 1", "Вариант 2", "Вариант 3"]
selected = input.choice("Выберите:", options)
conlog (selected)
```

### validateEmail(email)
Проверяет корректность email
```crack
imp input
email = input.readLine("Email: ")
valid = input.validateEmail(email)
if (valid) {
  conlog "Email корректный"
}
```

### sanitizeInput(text)
Очищает ввод от опасных символов
```crack
imp input
text = input.readLine("Введите текст: ")
clean = input.sanitizeInput(text)
conlog (clean)
```

## ⚡ Дополнительные функции

- `readEmail()` - Считывает email с валидацией
- `readInteger()` - Считывает целое число
- `readRange(min, max)` - Число в диапазоне
- `waitForKey()` - Ждет нажатия клавиши

## 🛡️ Обработка ошибок

Все функции включают обработку ошибок и возвращают безопасные значения по умолчанию.

## 📝 Лицензия

MIT License - derxanax 