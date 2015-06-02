'use strict';

export function unique(prefix) {
    let count = -1;
    return f => {
        return `${prefix}_${++count}`;
    };
}

export function noop() {
}


export function callbackTimeout(timer, onSuccess, onTimeout) {

    let timeout = setTimeout(() => {

        onSuccess = noop;
        onTimeout();

    }, timer);

    return function () {
        clearTimeout(timeout);
        onSuccess.apply(this, arguments);
    };
}


export function createElementWithID(parent, id) {
    var nEl = document.createElement('div');
    nEl.id = id;
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

export function isPositiveInt(newVal, oldVal) {
    return Number.isSafeInteger(newVal) && newVal > 0 ? newVal : oldVal;
}

