'use strict'

let number1 = null;
let number2 = null;
let operator = null;
let result = null;
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
            if (y === 0) return errorMessage;
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

        if (displayText === errorMessage) {
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
            display.innerText += buttonText;
            return;
        } 

        if (operators.hasOwnProperty(buttonId)) { // button pressed is an operator

            if (number1 === null) return;
    
            if (operator) { // if there is an existing operator
                const lastChar = displayText.slice(-1);

                if (lastChar >= 0 && lastChar <= 9) { // if there is an existing operator between numbers, calculate the number pair before adding the new operator symbol
                    result = operate(number1, number2, operator);
                    number1 = result;
                    number2 = null;
                    display.innerText = number1 + (number1 === errorMessage ? '' : operators[buttonId].symbol);
                } else { // last character is already an operator
                    display.innerText = displayText.slice(0, -1) + operators[buttonId].symbol; // remove previous operator and add new
                }
            } else {
                display.innerText += operators[buttonId].symbol;
            }

            operator = operators[buttonId].fn;
            return;
        }

        switch (buttonId) {
            case 'equal': 
                if (number2 === null) return;
                result = operate(number1, number2, operator);
                display.innerText = result;
                number1 = result;
                number2 = null;
                operator = null;
                break;
            case 'backspace':
                if (displayText === '') return;

                const lastChar = displayText.slice(-1);
                if (operatorSymbols.includes(lastChar)) { // operator is last character 
                    operator = null;
                } else if (operator) { // operator is between two numbers
                    number2 = removeDigit(number2);
                } else { // just a number
                    number1 = removeDigit(number1);
                }
                display.innerText = displayText.slice(0, -1);
                break;
            case 'clear':
                resetCalculator();
                break;
        }
        
    });
});

function removeDigit(number) {
    return Number(number.toString().slice(0, -1));
}

function resetCalculator() {
    display.innerText = '';
    number1 = null;
    number2 = null;
    operator = null;
    result = null;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}
