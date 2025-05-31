const readlineSync = require('readline-sync');

function readLine(prompt = '') {
  try {
    return readlineSync.question(prompt);
  } catch (error) {
    console.error('Ошибка чтения ввода:', error.message);
    return '';
  }
}

function readNumber(prompt = 'Введите число: ') {
  while (true) {
    try {
      const input = readlineSync.question(prompt);
      const number = parseFloat(input);
      
      if (isNaN(number)) {
        console.log('❌ Ошибка: введите корректное число');
        continue;
      }
      
      return number;
    } catch (error) {
      console.error('Ошибка чтения числа:', error.message);
      return 0;
    }
  }
}

function readPassword(prompt = 'Введите пароль: ') {
  try {
    return readlineSync.question(prompt, { hideEchoBack: true });
  } catch (error) {
    console.error('Ошибка чтения пароля:', error.message);
    return '';
  }
}

function confirm(message = 'Продолжить?') {
  try {
    const answer = readlineSync.keyInYNStrict(`${message} (y/n): `);
    return answer;
  } catch (error) {
    console.error('Ошибка подтверждения:', error.message);
    return false;
  }
}

function choice(message = 'Выберите вариант:', options = []) {
  if (!Array.isArray(options) || options.length === 0) {
    console.error('❌ Ошибка: список вариантов пуст');
    return null;
  }
  
  try {
    console.log(message);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    const index = readlineSync.keyInSelect(options, 'Ваш выбор:', { cancel: false });
    return options[index];
  } catch (error) {
    console.error('Ошибка выбора:', error.message);
    return null;
  }
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>\"'&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function readEmail(prompt = 'Введите email: ') {
  while (true) {
    const email = readLine(prompt);
    
    if (validateEmail(email)) {
      return email;
    }
    
    console.log('❌ Некорректный email адрес. Попробуйте снова.');
  }
}

function readInteger(prompt = 'Введите целое число: ') {
  while (true) {
    const number = readNumber(prompt);
    
    if (Number.isInteger(number)) {
      return number;
    }
    
    console.log('❌ Введите целое число без дробной части.');
  }
}

function readRange(prompt = 'Введите число: ', min = 0, max = 100) {
  while (true) {
    const number = readNumber(`${prompt} (от ${min} до ${max}): `);
    
    if (number >= min && number <= max) {
      return number;
    }
    
    console.log(`❌ Число должно быть от ${min} до ${max}`);
  }
}

function waitForKey(message = 'Нажмите любую клавишу для продолжения...') {
  try {
    console.log(message);
    readlineSync.keyInPause('', { guide: false });
  } catch (error) {
    console.error('Ошибка ожидания клавиши:', error.message);
  }
}

module.exports = {
  readLine,
  readNumber,
  readPassword,
  confirm,
  choice,
  validateEmail,
  sanitizeInput,
  readEmail,
  readInteger,
  readRange,
  waitForKey
}; 