'use strict'

let number1 = 0;
let number2 = 0;
let operator;
let operators = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
    power: '^',
}

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

        if (buttonNumber || buttonNumber === 0) {
            if (operator) {
                number2 = Number(number2 + buttonText);
                // alert(`num2 ${number2}`);
            } else {
                number1 = Number(number1 + buttonText);
                // alert(`num1 ${number1}`);
            }
            display.innerText += buttonText;
            return;
        } 

        if (operators.hasOwnProperty(buttonId)) { // button pressed is an operator
    
            if (operator) { // if there is an existing operator
                const lastChar = displayText.slice(-1);

                if (lastChar >= 0 && lastChar <= 9) { // if there is an existing operator between numbers, calculate the number pair before adding the new operator symbol
                    number1 = operate(number1, number2, operator);
                    number2 = 0;
                    display.innerText = number1 + (number1 === errorMessage ? '' : operators[buttonId]);
                } else { // last character is already an operator
                    display.innerText = displayText.slice(0, -1) + operators[buttonId]; // remove previous operator and add new
                }
            } else {
                display.innerText += operators[buttonId];
            }


            switch (buttonId) { // future refactor alternative: operator = operators[buttonId].fn 
                case 'add':
                    operator = add;
                    return;
                case 'subtract':
                    operator = subtract;
                    return;
                case 'multiply':
                    operator = multiply;
                    return;
                case 'divide':
                    operator = divide;
                    return;
                case 'power':
                    operator = pow;
                    return;
            }
        }

        switch (buttonId) {
            case 'equal': 
                number1 = operate(number1, number2, operator);
                display.innerText = number1;
                number2 = 0;
                operator = null;
                break;
            case 'clear':
                resetCalculator();
        }
        
    });
});

function resetCalculator() {
    display.innerText = '';
    number1 = 0;
    number2 = 0;
    operator = null;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}
 
function add(x, y) {
    const sum = x + y;
    return sum;
}

function subtract(x, y) {
    const difference = x - y;
    return difference
}

function multiply(x, y) {
    const product = x * y;
    return product;
}

function divide(x, y) {
    if (y === 0) {
        alert(`Can't divide by zero!`);
        return errorMessage;
    }
    const quotient = x / y;
    return quotient;
}

function pow(x, y) {
    const power = x ** y;
    return power;
}