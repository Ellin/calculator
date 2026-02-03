'use strict'

let number1 = {
    value: null,
    sign: 1,
    isDecimal: false,
    decimalPart: '.', // string
    computedValue: function() {
        return Number(this.value + this.decimalPart) * this.sign;
    }
};

let number2 = {
    value: null,
    sign: 1,
    isDecimal: false,
    decimalPart: '.',
    computedValue: function() {
        return Number(this.value + this.decimalPart) * this.sign;
    }
};

let operator = null; // holds operator names (e.g. 'add')
let result = null;
let isError = false;

let operators = {
    add: {
        symbol: '+',
        fn: (x, y) => x + y,
    },
    subtract: {
        symbol: '-',
        fn: (x, y) => x - y,
    },
    multiply: {
        symbol: '×',
        fn: (x, y) => x * y,
    },
    divide: {
        symbol: '÷',
        fn: (x, y) => {
            if (y === 0) {
                isError = true;
                return;
            }
            return x / y;
        },
    },
    power: {
        symbol: '^',
        fn: (x, y) => x ** y,
    },
};

let operatorSymbols = [operators.add.symbol, operators.subtract.symbol, operators.multiply.symbol, operators.divide.symbol, operators.power.symbol];

const errorMessage = "error";

const display = document.querySelector('.display');
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        const buttonText = e.target.innerText;
        const buttonNumber = Number(buttonText);
        const displayText = display.innerText;

        if (isError) {
            resetCalculator();
        }

        if (buttonNumber || buttonNumber === 0) { // button pressed is a number
            if(result !== null && !operator) resetCalculator();

            if (operator) {
                if (number2.isDecimal) {
                    number2.decimalPart += buttonText;
                } else {
                    number2.value = Number((number2.value === null ? '' : number2.value) + buttonText);
                }
            } else {
                if (number1.isDecimal) {
                    number1.decimalPart += buttonText;
                } else {
                    number1.value = Number((number1.value === null ? '' : number1.value) + buttonText);
                }
            }
            display.innerText = createDisplayString();
            return;
        } 

        if (operators.hasOwnProperty(buttonId)) { // button pressed is an operator

            if (number1.value === null) return;
    
            if (number2.value !== null) { // if there is an existing operator between numbers, calculate the number pair before adding the new operator symbol
                calculate();
            } 

            operator = buttonId;
            display.innerText = createDisplayString();
            return;
        }

        switch (buttonId) {
            case 'decimal': {
                if (operator && !number2.isDecimal) {
                    number2.isDecimal = true;
                    number2.value ??= 0;
                } else if (!number1.isDecimal) {
                    number1.isDecimal = true;
                }
                display.innerText = createDisplayString();
                break;
            }
            case 'sign-toggle':
                if (operator) {
                    number2.sign *= -1;
                } else {
                    number1.sign *= -1;
                }
                display.innerText = createDisplayString();
                break;
            case 'equal': 
                if (number2.value === null) return;
                calculate();
                operator = null;
                display.innerText = createDisplayString();
                break;
            case 'backspace':
                if (displayText === '') return;

                if (number2.value !== null || number2.sign < 0) {
                    removeLastDigit(number2);
                } else if (operator) {
                    operator = null;
                } else {
                    removeLastDigit(number1);
                }
                display.innerText = createDisplayString();
                break;
            case 'clear':
                resetCalculator();
                break;
        }
        
    });
});

function createDisplayString() {
    if (isError) return errorMessage;

    const operatorSymbol = operator ? operators[operator].symbol : '';
    const number1String = createNumberString(number1);
    const number2String = createNumberString(number2);

    if (number2.sign < 0) {
        return number1String + operatorSymbol + '(' + number2String + ')';
    } else {
        return number1String + operatorSymbol + number2String;
    }
}

function createNumberString(number) {
    const sign = number.sign < 0 ? '-' : '';
    const decimalPart = number.isDecimal ? number.decimalPart : '';
    const intPart = number.value ?? '';

    return sign + intPart + decimalPart;
}

function removeLastDigit(number) {
// if decimal, remove from decimal part
    if (number.isDecimal) {
        if (number.decimalPart === '.') {
            number.isDecimal = false;
        } else {
            number.decimalPart = number.decimalPart.slice(0, -1);
        }
        return;
    } 

    if (number.value === null && number.sign < 0) { // last digit is '-'
        number.sign = 1;
    } else if (number.value >= 0 && number.value < 10) {
        number.value = null;
    } else {
        number.value = Number(number.value.toString().slice(0, -1));
    }
}

function resetCalculator() {
    display.innerText = '';
    number1.value = null;
    number1.sign = 1;
    number1.isDecimal = false;
    number1.decimalPart = '.';
    number2.value = null;
    number2.sign = 1;
    number2.isDecimal = false;
    number2.decimalPart = '.';
    operator = null;
    result = null;
    isError = false;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}

function calculate() {
    result = operate(number1.computedValue(), number2.computedValue(), operators[operator].fn);
    [number1.value, number1.decimalPart] = String(result).split('.');

    if (!Number.isInteger(result)) {
        number1.isDecimal = true;
        number1.decimalPart = '.' + number1.decimalPart; 
    } else {
        number1.isDecimal = false;
        number1.decimalPart = '.';
    }
    number1.sign = result < 0 ? -1 : 1;
    number1.value = Math.abs(number1.value);

    number2.value = null;
    number2.sign = 1;
    number2.isDecimal = false;
    number2.decimalPart = '.';
}