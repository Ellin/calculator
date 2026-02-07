'use strict'

let number1 = {
    value: null,
    sign: 1,
    isDecimal: false,
    decimalPart: '', // string
    computedValue: function() {
        const decimal = this.isDecimal ? '.' : '';
        return Number(this.value + decimal + this.decimalPart) * this.sign;
    }
};

let number2 = {
    value: null,
    sign: 1,
    isDecimal: false,
    decimalPart: '',
    computedValue: function() {
        const decimal = this.isDecimal ? '.' : '';
        return Number(this.value + decimal + this.decimalPart) * this.sign;
    }
};


const displayLimit = 13; // max # of characters
let operator = null; // holds operator names (e.g. 'add')
let result = null;
let resultDisplayString = null;
let isError = false;
let errorType;

const errorMessages = {
    infinity: 'Number too big!',
    divisionByZero: `Can't divide by 0`,
    default: 'Error',
}

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
                errorType = 'divisionByZero';
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

const line1 = document.querySelector('.line-1');
const line2 = document.querySelector('.line-2');
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        const buttonText = e.target.innerText;
        const buttonNumber = Number(buttonText);

        if (isError) {
            resetCalculator();
        }

        if (buttonNumber || buttonNumber === 0) { // button pressed is a number
            if (result !== null && !operator) resetCalculator();
            if (line2.innerText.length === displayLimit) return; 

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
            updateDisplay();
            return;
        } 

        if (operators.hasOwnProperty(buttonId)) { // button pressed is an operator
            if (number1.value === null) return;
            
            // if (operator === null && line2.innerText.length === displayLimit) return;
            
            if (number2.value !== null) { // if there is an existing operator between numbers, calculate the number pair before adding the new operator symbol
                calculate();
            } 

            operator = buttonId;
            updateDisplay();
            return;
        }

        switch (buttonId) {
            case 'decimal': {
                if (line2.innerText.length === displayLimit) return;

                // Prevent adding decimal if number contains 'e'. This would cause NaN issues.
                if (operator && !number2.isDecimal && !String(number2.value).includes('e')) { 
                    number2.isDecimal = true;
                    number2.value ??= 0;
                } else if (!number1.isDecimal && !String(number1.value).includes('e')) {
                    number1.isDecimal = true;
                    number1.value ??= 0;
                }
                updateDisplay();
                break;
            }
            case 'sign-toggle':
                if (operator) {
                    if (number2.sign > 0 && line2.innerText.length === displayLimit) return;
                    number2.sign *= -1;
                } else {
                    if (number1.sign > 0 && line2.innerText.length === displayLimit) return;
                    number1.sign *= -1;
                }
                updateDisplay();
                break;
            case 'equal': 
                if (number2.value === null) return;
                calculate();
                operator = null;
                updateDisplay();
                break;
            case 'backspace':
                if (line2.innerText === '') return;

                if (number2.value !== null || number2.sign < 0) {
                    removeLastDigit(number2);
                } else if (operator) {
                    operator = null;
                } else {
                    removeLastDigit(number1);
                }
                updateDisplay();
                break;
            case 'clear':
                resetCalculator();
                break;
        }
        
    });
});

function updateDisplay() {
    if (isError) {
        displayErrorMessage();
        return;
    }

    const operatorSymbol = operator ? operators[operator].symbol : '';
    const number1String = resultDisplayString ?? createNumberString(number1);
    const number2String = (number2.sign < 0) ? `(${createNumberString(number2)})` : createNumberString(number2);

    if (operator) {
        line1.textContent = number1String + ' ' + operatorSymbol;
        line2.textContent = number2String;
    } else {
        line1.textContent = '';
        line2.textContent = number1String;
    }
}

function displayErrorMessage() {
    line1.textContent = errorMessages[errorType];
    line2.textContent = errorMessages.default;
}

function createNumberString(number) {
    const sign = number.sign < 0 ? '-' : '';
    const decimalPart = number.isDecimal ? ('.' + number.decimalPart) : '';
    const intPart = number.value ?? '';

    return sign + intPart + decimalPart;
}

function removeLastDigit(number) {
// if decimal, remove from decimal part
    if (number.isDecimal) {
        if (number.decimalPart === '') {
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
    line1.innerText = '';
    line2.innerText = '';
    number1.value = null;
    number1.sign = 1;
    number1.isDecimal = false;
    number1.decimalPart = '';
    number2.value = null;
    number2.sign = 1;
    number2.isDecimal = false;
    number2.decimalPart = '';
    operator = null;
    result = null;
    resultDisplayString = null;
    isError = false;
}

function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}

function calculate() {
    // Test logs
    console.log(`${number1.computedValue()} ${operators[operator].symbol} ${number2.computedValue()}`);

    result = operate(number1.computedValue(), number2.computedValue(), operators[operator].fn);

    // Check for errors
    if (result === Infinity || result === -Infinity) {
        isError = true;
        errorType = 'infinity';
        return;
    }

    // Test logs
    console.log('true result is');
    console.log(result);
    // -------

    const resultString = String(result);
    resultDisplayString = createResultDisplayString();

    if (resultString.includes('.')) {
        const [intPart, decimalPart] = resultString.split('.');
        number1.value = Math.abs(intPart);
        number1.isDecimal = true;
        number1.decimalPart = decimalPart; 
    } else {
        number1.value = Math.abs(result)
        number1.isDecimal = false;
        number1.decimalPart = '';
    }

    number1.sign = result < 0 ? -1 : 1;

    number2.value = null;
    number2.sign = 1;
    number2.isDecimal = false;
    number2.decimalPart = '';
}



function createResultDisplayString() {
    const absResult = Math.abs(result);
    const isNegative = result < 0;
    const isDecimal = !Number.isInteger(result);
    let precision = displayLimit;
    let resultDisplayString = String(result);
    let fractionDigits;

    if (resultDisplayString.length <= displayLimit) return resultDisplayString;

    if (absResult > 1 && absResult < ('1e+' + displayLimit)) {
        // reduce the precision by 1 if the number contains a decimal or is negative to account for the '.' and '-' signs
        if (isDecimal) precision--;
        if (isNegative) precision--;
        resultDisplayString = parseFloat((result).toPrecision(precision)); // parseFloat used to remove trailing zeros

        return resultDisplayString;
    } 

    // Case: Smallish numbers with up to a few leading zeros -> round result to the last decimal place that fits in the display
    if (absResult < 1 && absResult >= 0.0001) { // max 4 leading zeros for readability
        let decimalPlaces = displayLimit - 2; // -2 accounts for the leading '0' and '.' characters
        if (isNegative) decimalPlaces--;

        return parseFloat((result).toFixed(decimalPlaces));
    }

    // Case: Very small numbers with many leading zeros -> convert to scientific notation to prevent significant digits from being pushed off display
    if (absResult < 0.0001) {
        fractionDigits = displayLimit - 5; // -5 to account for the integer (1), decimal (1), and 'e-n' (3) characters when converting to exponential
        if (isNegative) fractionDigits--;

        if (absResult < 1e-9 && absResult > 1e-100) {
            fractionDigits--; // this accounts for an additional character taken up by 'e-nn'
        } else if (absResult <= 1e-100) {
            fractionDigits -= 2; // this accounts for 2 additional characters taken up by 'e-nnn'
        }

        return (result).toExponential(fractionDigits);
    }

    // CASE: Handle very big numbers
    let standardFormLimit = '1e+' + displayLimit;
    if (result >= standardFormLimit) {
        fractionDigits = displayLimit - 6; // -6 to account for the integer (1), decimal (1), and 'e-nn' (4) characters when converting to exponential
        if (isNegative) fractionDigits--; 
        if (result >= 1e+99 ) fractionDigits--; // Account for additional exponent digit ('e-nnn')

        resultDisplayString = String((result.toExponential())); // not specifying the fraction digits leads to a shorter and more readable result in certain cases by excluding trailing 0's
        const specifiedExponential = String((result).toExponential(fractionDigits));

        return resultDisplayString.length <= specifiedExponential.length ? resultDisplayString : specifiedExponential;
    }
}










