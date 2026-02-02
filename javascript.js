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
                result = operate(number1.computedValue(), number2.computedValue(), operators[operator].fn);
                number1.value = result;
                number2.value = null;
            } 

            operator = buttonId;
            display.innerText = createDisplayString();
            return;
        }

        switch (buttonId) {
            case 'equal': 
                if (number2.value === null) return;
                result = operate(number1.computedValue(), number2.computedValue(), operators[operator].fn);
                number1.value = result;
                number2.value = null;
                operator = null;
                display.innerText = createDisplayString();
                break;
            case 'backspace':
                if (displayText === '') return;

                if (number2.value !== null) {
                    number2.value = removeDigit(number2.value);
                } else if (operator) {
                    operator = null;
                } else {
                    number1.value = removeDigit(number1.value);
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
    const number1String = (number1.value !== null) ? String(number1.value) : '';
    const number2String = (number2.value !== null) ? String(number2.value) : '';
    
    return number1String + operatorSymbol + number2String;
}

function removeDigit(number) {
    // Note: improve for handling negative numbers in future
    if (number >= -9 && number < 10) return null;
    return Number(number.toString().slice(0, -1)); 
}

function resetCalculator() {
    display.innerText = '';
    number1.value = null;
    number2.value= null;
    operator = null;
    result = null;
    isError = false;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}
