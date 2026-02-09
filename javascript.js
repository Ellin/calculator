'use strict'

let number1 = {
    integerPart: null,
    sign: 1,
    containsDecimal: false,
    decimalPart: '', // string
    computedValue: function() {
        const decimal = this.containsDecimal ? '.' : '';
        return Number(this.integerPart + decimal + this.decimalPart) * this.sign;
    }
};

let number2 = {
    integerPart: null,
    sign: 1,
    containsDecimal: false,
    decimalPart: '',
    computedValue: function() {
        const decimal = this.containsDecimal ? '.' : '';
        return Number(this.integerPart + decimal + this.decimalPart) * this.sign;
    }
};

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
            }
            return x / y;
        },
    },
    power: {
        symbol: '^',
        fn: (x, y) => x ** y,
    },
};

const errorMessages = {
    infinity: 'Number too big!',
    divisionByZero: `Can't divide by 0`,
    default: 'Error',
}

const displayLimit = 13; // max # of characters

let operatorName = null; // e.g. 'add'
let result = null;
let resultDisplayString = null;
let isError = false;
let errorType = null;

// DOM elements
const displayLineTop = document.querySelector('.line-1');
const displayLineBottom = document.querySelector('.line-2');
const buttons = document.querySelectorAll('button');

// Handle button clicks
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        const buttonText = e.target.innerText;

        if (isError) {
            resetCalculator();
        }

        // Number button clicked
        if (isNumber(buttonText)) {
            handleNumberInput(buttonText);
            return;
        } 

        // Operator button clicked
        if (operators.hasOwnProperty(buttonId)) { 
            handleOperatorInput(buttonId);
            return;
        }

        // Other button clicked
        switch (buttonId) {
            case 'decimal':
                handleDecimalInput();
                break;
            case 'sign-toggle':
                handleSignToggleInput();
                break;
            case 'equal':
                handleEqualInput();
                break;                
            case 'backspace':
                handleBackspaceInput();
                break;
            case 'clear':
                resetCalculator();
                break;
        }
    });
});


// Keyboard support
document.addEventListener('keydown', (e) => {
    const keyPressed = e.key;

    if (isError) {
        resetCalculator();
    }

    if (isNumber(keyPressed)) {
        handleNumberInput(keyPressed);
        return;
    } 

    switch (keyPressed) {
        case '-':
            if (number1.integerPart === null || (operatorName && number2.integerPart === null)) { // flip signs only at the start of number inputs
                handleSignToggleInput();
            } else {
                handleOperatorInput('subtract');
            }
            break;
        case '+':
            handleOperatorInput('add');
            break;
        case '*':
            handleOperatorInput('multiply');
            break;
        case '/':
            handleOperatorInput('divide');
            break;
        case '^': 
            handleOperatorInput('power');
            break;
        case '.':
            handleDecimalInput();
            break;
        case 'Enter':
            e.preventDefault();
            handleEqualInput();
            break;                
        case 'Backspace':
            handleBackspaceInput();
            break;
    }
        
});

function isNumber(inputString) {
    const isNumber = !Number.isNaN(parseInt(inputString));
    return isNumber;
}

function handleNumberInput(numberInput) {
    if (result !== null && !operatorName) resetCalculator(); // Reset calculator if number is entered on top of a result without any operations

    if (displayLineBottom.innerText.length === displayLimit) return; 

    if (operatorName) {
        if (number2.containsDecimal) {
            number2.decimalPart += numberInput;
        } else {
            number2.integerPart = Number((number2.integerPart === null ? '' : number2.integerPart) + numberInput);
        }
    } else {
        if (number1.containsDecimal) {
            number1.decimalPart += numberInput;
        } else {
            number1.integerPart = Number((number1.integerPart === null ? '' : number1.integerPart) + numberInput);
        }
    }
    updateDisplay();
}

function handleOperatorInput(newOperatorName) {
    if (number1.integerPart === null) return;
    
    if (number2.integerPart !== null) { // calculate existing number pairs before adding the new operator symbol
        calculate();
    } 

    operatorName = newOperatorName;
    updateDisplay();
}

function handleDecimalInput() {
    if (displayLineBottom.innerText.length === displayLimit) return;

    // Prevent adding decimal if number is in exponential form. This would cause NaN issues.
    if (operatorName && !number2.containsDecimal && !String(number2.integerPart).includes('e')) { 
        number2.containsDecimal = true;
        number2.integerPart ??= 0;
    } else if (!number1.containsDecimal && !String(number1.integerPart).includes('e') && !operatorName) {
        number1.containsDecimal = true;
        number1.integerPart ??= 0;
    }
    updateDisplay();
}

function handleSignToggleInput() { 
    if (operatorName) {
        if (number2.sign > 0 && displayLineBottom.innerText.length > displayLimit - 3) return; // need to reserve at least 3 characters for '(-)' symbols
        number2.sign *= -1;
    } else {
        if (number1.sign > 0 && displayLineBottom.innerText.length === displayLimit) return;
        number1.sign *= -1;
    }
    updateDisplay();
}

function handleEqualInput() {
    if (number2.integerPart === null) return;
    calculate();
    operatorName = null;
    updateDisplay();
}

function handleBackspaceInput() {
    if (displayLineBottom.innerText === '') return;

    if (number2.integerPart !== null || number2.sign < 0) {
        removeLastCharacter(number2);
    } else if (operatorName) {
        operatorName = null;
    } else {
        removeLastCharacter(number1);
    }
    updateDisplay();
}

function updateDisplay() {
    if (isError) {
        displayErrorMessage();
        return;
    }

    const operatorSymbol = operatorName ? operators[operatorName].symbol : '';
    const number1String = resultDisplayString ?? createNumberString(number1);
    const number2String = (number2.sign < 0) ? `(${createNumberString(number2)})` : createNumberString(number2);

    if (operatorName) {
        displayLineTop.textContent = number1String + ' ' + operatorSymbol;
        displayLineBottom.textContent = number2String;
    } else {
        displayLineTop.textContent = '';
        displayLineBottom.textContent = number1String;
    }
}

function displayErrorMessage() {
    displayLineTop.textContent = errorMessages[errorType];
    displayLineBottom.textContent = errorMessages.default;
}

function createNumberString(number) {
    const sign = number.sign < 0 ? '-' : '';
    const decimalPart = number.containsDecimal ? ('.' + number.decimalPart) : '';
    const intPart = number.integerPart ?? '';
    const numberString = sign + intPart + decimalPart;

    return numberString;
}

function removeLastCharacter(number) {
    if (number.containsDecimal) {
        if (number.decimalPart === '') {
            number.containsDecimal = false;
        } else {
            number.decimalPart = number.decimalPart.slice(0, -1);
        }
        return;
    } 

    if (number.integerPart === null && number.sign < 0) {
        number.sign = 1;
    } else if (number.integerPart >= 0 && number.integerPart < 10) {
        number.integerPart = null;
    } else {
        number.integerPart = Number(number.integerPart.toString().slice(0, -1));
    }
}

function resetCalculator() {
    displayLineTop.innerText = '';
    displayLineBottom.innerText = '';
    resetNumber(number1);
    resetNumber(number2);
    operatorName = null;
    result = null;
    resultDisplayString = null;
    isError = false;
    errorType = null;
}

function resetNumber(number) {
    number.integerPart = null;
    number.sign = 1;
    number.containsDecimal = false;
    number.decimalPart = '';
}


function operate(number1, number2, operatorFn) {
    return operatorFn(number1, number2);
}

function calculate() {
    result = operate(number1.computedValue(), number2.computedValue(), operators[operatorName].fn);

    // Tests: Show unprocessed result in console 
    console.log(`${number1.computedValue()} ${operators[operatorName].symbol} ${number2.computedValue()}`);
    console.log('Unprocessed result is:');
    console.log(result);

    // Check for big number errors
    if ((result === Infinity || result === -Infinity) && errorType !== 'divisionByZero') {
        isError = true;
        errorType = 'infinity';
        return;
    }

    if (Math.abs(result) < Number.EPSILON) { // Treat numbers less than epsilon as 0 to prevent floating point weirdness, e.g. (0.1 + 0.2) - 0.3 => 5.551115123125783e-17 
        result = 0;
    }

    const resultString = String(result);
    resultDisplayString = createResultDisplayString();

    if (resultString.includes('.')) {
        const [intPart, decimalPart] = resultString.split('.');
        number1.integerPart = Math.abs(intPart);
        number1.containsDecimal = true;
        number1.decimalPart = decimalPart; 
    } else {
        number1.integerPart = Math.abs(result)
        number1.containsDecimal = false;
        number1.decimalPart = '';
    }

    number1.sign = result < 0 ? -1 : 1;

    resetNumber(number2);
}

function createResultDisplayString() {
    const absResult = Math.abs(result);
    const isNegative = result < 0;
    const containsDecimal = String(result).includes('.');
    const biggestStandardFormNumber = Number('1e+' + displayLimit) - 1;
    const standardFormLimit = isNegative ? (Math.floor(biggestStandardFormNumber / 10)) : biggestStandardFormNumber; // reduce the comparison number by a digit to account for negative sign character
    let resultDisplayString = String(result);
    let fractionDigits;

    if (resultDisplayString.length <= displayLimit) return resultDisplayString; // No special handling required
   
    // Case: Fractional numbers with up to a few leading zeros -> round result to the last decimal place that fits in the display
    if (containsDecimal && (absResult < standardFormLimit) && (absResult >= 0.0001)) { // max 4 leading zeros for readability
        // Test Log
        console.log('Case: Fractional number needing rounding');

        let numberOfIntegerPlaces = String(parseInt(absResult)).length;
        let decimalPlaces = Math.max(0, displayLimit - numberOfIntegerPlaces - 1); // -1 for '.' character
        if (isNegative) decimalPlaces--;

        return parseFloat((result).toFixed(decimalPlaces)); // Warning: parseFloat used to remove trailing zeros, which may be significant
    }

    // Case: Very small numbers with many leading zeros -> convert to scientific notation to prevent significant digits from being pushed off display
    if (absResult < 0.0001) {
        // Test Log
        console.log('Case: VERY small numbers');

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
    if (absResult > standardFormLimit) {
        // Test Log
        console.log('Case: BIG NUM');

        fractionDigits = displayLimit - 6; // -6 to account for the integer (1), decimal (1), and 'e-nn' (4) characters when converting to exponential

        if (isNegative) fractionDigits--;
        if (result >= 1e+99 ) fractionDigits--; // Account for additional exponent digit ('e-nnn')

        console.log(fractionDigits);

        resultDisplayString = String((result.toExponential())); // not specifying the fraction digits leads to a shorter and more readable result in certain cases by excluding trailing 0's
        const specifiedExponential = String((result).toExponential(fractionDigits));

        return (resultDisplayString.length <= specifiedExponential.length) ? resultDisplayString : specifiedExponential;
    }

    // Tests
    console.log('WARNING: result not handled!');
}