'use strict'

let number1 = {
    integerPart: '0', // type: string
    sign: 1,
    containsDecimal: false,
    decimalPart: '', // type: string
    computedValue: function() {
        const decimal = this.containsDecimal ? '.' : '';
        return Number(this.integerPart + decimal + this.decimalPart) * this.sign;
    }
};

let number2 = {
    integerPart: '',
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
                updateDisplay();
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
            if (!number1.integerPart || (operatorName && !number2.integerPart)) { // flip signs only at the start of number inputs
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
        } else if (number2.integerPart === '0') {
            number2.integerPart = numberInput;
        } else {
            number2.integerPart += numberInput;
        }
    } else {
        if (number1.containsDecimal) {
            number1.decimalPart += numberInput;
        } else if (number1.integerPart === '0') {
            number1.integerPart = numberInput; // NEW LINE
        } else {
            number1.integerPart += numberInput;
        }
    }
    updateDisplay();
}

function handleOperatorInput(newOperatorName) {
    if (!number1.integerPart) return;
    
    if (number2.integerPart) { // calculate existing number pairs before adding the new operator symbol
        calculate();
    } 

    operatorName = newOperatorName;
    updateDisplay();
}

function handleDecimalInput() {
    if (result !== null && !operatorName) resetCalculator(); // Reset calculator if decimal is entered on top of a result without any operation
    if (displayLineBottom.innerText.length === displayLimit) return;

    // Prevent adding decimal if number is in exponential form. This would cause NaN issues.
    if (operatorName && !number2.containsDecimal && !number2.integerPart.includes('e')) { 
        number2.containsDecimal = true;
        number2.integerPart ||= '0';
    } else if (!number1.containsDecimal && !number1.integerPart.includes('e') && !operatorName) {
        number1.containsDecimal = true;
        number1.integerPart ||= '0';
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
    if (!number2.integerPart) return;
    calculate();
    operatorName = null;
    updateDisplay();
}

function handleBackspaceInput() {
    if (displayLineBottom.innerText === '') return;

    if (number2.integerPart || number2.sign < 0) {
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
    const decimalPart = number.containsDecimal ? `.${number.decimalPart}`: ''; 
    const intPart = number.integerPart;
    const numberString = sign + intPart + decimalPart;

    return numberString;
}

function removeLastCharacter(number) {
    if (number.containsDecimal) {
        if (!number.decimalPart) {
            number.containsDecimal = false;
        } else {
            number.decimalPart = number.decimalPart.slice(0, -1);
        }
        return;
    } 

    if (!number.integerPart && number.sign < 0) {
        number.sign = 1;
    } else if (number.integerPart.length === 1) {
        number.integerPart = '';
    } else {
        number.integerPart = number.integerPart.slice(0, -1);
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
    number.integerPart = (number === number1) ? '0' : '';
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

    updateResultDisplayString();
    updateNumber1(String(result));
    resetNumber(number2);
}

function updateNumber1(resultString) {
    if (resultString.includes('.')) {
        const [intPart, decimalPart] = resultString.split('.');
        number1.integerPart = String(Math.abs(intPart));
        number1.containsDecimal = true;
        number1.decimalPart = decimalPart; 
    } else {
        number1.integerPart = String(Math.abs(result));
        number1.containsDecimal = false;
        number1.decimalPart = '';
    }
    number1.sign = result < 0 ? -1 : 1;
}

function updateResultDisplayString() {
    const absResult = Math.abs(result);
    const isNegative = result < 0;
    const resultString = String(result); 
    const containsDecimal = resultString.includes('.');
    const biggestStandardFormNumber = Number('1e+' + displayLimit) - 1;
    const standardFormLimit = isNegative ? (Math.floor(biggestStandardFormNumber / 10)) : biggestStandardFormNumber; // reduce the comparison number by a digit to account for negative sign character
    resultDisplayString = resultString;
    let fractionDigits;

    if (resultDisplayString.length <= displayLimit) return;
   
    // CASE: FRACTIONAL NUMBERS (with up to a few leading zeros) -> round to the last decimal place that fits in the display
    if (containsDecimal && (absResult < standardFormLimit) && (absResult >= 0.0001)) { // limit = 0.0001 for readability
        let numberOfIntegerPlaces = String(parseInt(absResult)).length;
        let decimalPlaces = Math.max(0, displayLimit - numberOfIntegerPlaces - 1); // -1 for '.' character
        if (isNegative) decimalPlaces--;

        resultDisplayString = parseFloat((result).toFixed(decimalPlaces)); // Note: parseFloat used to remove trailing zeros, which may be significant
        return;
    }

    // CASE: VERY SMALL NUM (small in magnitude; practically zero) -> convert to scientific notation to prevent significant digits from being pushed off display
    if (absResult < 0.0001) {
        fractionDigits = displayLimit - 5; // -5 to account for the integer (1), decimal (1), and 'e-n' (3) characters when converting to exponential
        if (isNegative) fractionDigits--;
        if (absResult < 1e-9 && absResult >= Number.EPSILON) fractionDigits--;  // account for +1 character taken up by 'e-nn'

        resultDisplayString = (result).toExponential(fractionDigits);
        return;
    }

    // CASE: BIG NUM
    if (absResult > standardFormLimit) {
        fractionDigits = displayLimit - 6; // -6 to account for the integer (1), decimal (1), and 'e-nn' (4) characters when converting to exponential
        if (isNegative) fractionDigits--;
        if (result >= 1e+99 ) fractionDigits--; // account for +1 exponent digit ('e-nnn')

        resultDisplayString = String((result.toExponential())); // not specifying the fraction digits leads to a shorter and more readable result in certain cases by excluding trailing 0's
        const specifiedExponential = String((result).toExponential(fractionDigits));

        resultDisplayString = (resultDisplayString.length <= specifiedExponential.length) ? resultDisplayString : specifiedExponential;
        return;
    }

    // Tests
    console.log('⚠️ WARNING: result not handled!');
}