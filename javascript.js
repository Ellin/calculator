'use strict'

let number1 = null;
let number2 = null;
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
                number2 = Number((number2 === null ? '' : number2) + buttonText);
                // alert(`num2 ${number2}`);
            } else {
                number1 = Number((number1 === null ? '' : number1) + buttonText);
                // alert(`num1 ${number1}`);
            }
            display.innerText = createDisplayString();
            return;
        } 

        if (operators.hasOwnProperty(buttonId)) { // button pressed is an operator

            if (number1 === null) return;
    
            if (operator) { // if there is an existing operator
                const lastChar = displayText.slice(-1);

                if (lastChar >= 0 && lastChar <= 9) { // if there is an existing operator between numbers, calculate the number pair before adding the new operator symbol
                    result = operate(number1, number2, operators[operator].fn);
                    number1 = result;
                    number2 = null;
                }
            } 

            operator = buttonId;
            display.innerText = createDisplayString();
            return;
        }

        switch (buttonId) {
            case 'equal': 
                if (number2 === null) return;
                result = operate(number1, number2, operators[operator].fn);
                number1 = result;
                number2 = null;
                operator = null;
                display.innerText = createDisplayString();
                break;
            case 'backspace':
                if (displayText === '') return;

                if (number2 !== null) {
                    number2 = removeDigit(number2);
                } else if (operator) {
                    operator = null;
                } else {
                    number1 = removeDigit(number1);
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
    const number1String = (number1 !== null) ? String(number1) : '';
    const number2String = (number2 !== null) ? String(number2) : '';
    
    return number1String + operatorSymbol + number2String;
}

function removeDigit(number) {
    // Note: improve for handling negative numbers in future
    if (number >= -9 && number < 10) return null;
    return Number(number.toString().slice(0, -1)); 
}

function resetCalculator() {
    display.innerText = '';
    number1 = null;
    number2 = null;
    operator = null;
    result = null;
    isError = false;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}
