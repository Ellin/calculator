'use strict'

let number1 = 0;
let number2 = 0;
let operator;

const display = document.querySelector('.display');
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        const buttonText = e.target.innerText;
        const buttonNumber = Number(buttonText);

        if (buttonNumber || buttonNumber === 0) {
            if (operator) {
                number2 = Number(number2 + buttonText);
                alert(`num2 ${number2}`);
            } else {
                number1 = Number(number1 + buttonText);
                alert(`num1 ${number1}`);
            }
            display.innerText += buttonText;
            return;
        } 

        switch (buttonId) {
            case 'add':
                operator = add;
            case 'subtract':
                operator = subtract;
            case 'multiply':
                operator = multiply;
            case 'divide':
                operator = divide;
            case 'power':
                operator = pow;
            default:
                display.innerText += buttonText;
        }
        
    });
});

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
        return 'error';
    }
    const quotient = x / y;
    return quotient;
}

function pow(x, y) {
    const power = x ** y;
    return power;
}