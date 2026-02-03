'use strict'

let number1 = {
    value: null,
    sign: 1,
    computedValue: function() {
        return this.value * this.sign;
    }
};

let number2 = {
    value: null,
    sign: 1,
    computedValue: function() {
        return this.value * this.sign;
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
                number2.value = Number((number2.value === null ? '' : number2.value) + buttonText);
            } else {
                number1.value = Number((number1.value === null ? '' : number1.value) + buttonText);
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
    const number1Sign = number1.sign < 0 ? '-' : '';
    const number2Sign = number2.sign < 0 ? '-' : '';
    const number1String = (number1.value !== null) ? String(number1.value) : '';
    const number2String = (number2.value !== null) ? String(number2.value) : '';
    
    return number1Sign + number1String + operatorSymbol + number2Sign + number2String;
}

function removeLastDigit(number) {
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
    number2.value= null;
    number2.sign = 1;
    operator = null;
    result = null;
    isError = false;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}

function calculate() {
    result = operate(number1.computedValue(), number2.computedValue(), operators[operator].fn);
    number1.sign = result < 0 ? -1 : 1;
    number1.value = Math.abs(result);
    number2.value = null;
    number2.sign = 1;
}