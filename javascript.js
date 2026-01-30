'use strict'

const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const buttonId = e.target.id;
        alert(`do something with ${buttonId}`);
    });
});
 