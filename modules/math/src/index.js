function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Аргументы должны быть числами');
  }
  return a + b;
}

function subtract(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Аргументы должны быть числами');
  }
  return a - b;
}

function multiply(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Аргументы должны быть числами');
  }
  return a * b;
}

function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Аргументы должны быть числами');
  }
  if (b === 0) {
    throw new Error('Деление на ноль невозможно');
  }
  return a / b;
}

function power(base, exponent) {
  if (typeof base !== 'number' || typeof exponent !== 'number') {
    throw new Error('Аргументы должны быть числами');
  }
  return Math.pow(base, exponent);
}

function sqrt(number) {
  if (typeof number !== 'number') {
    throw new Error('Аргумент должен быть числом');
  }
  if (number < 0) {
    throw new Error('Нельзя извлечь корень из отрицательного числа');
  }
  return Math.sqrt(number);
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  power,
  sqrt
}; 