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


export function createElementWithID(parent, id, cleanContent = false) {
    var nEl = document.createElement('div');
    nEl.id = id;
    if (cleanContent) {
        parent.innerHTML = '';
    }
    parent.appendChild(nEl);
    return nEl;
}

export function isPositiveInt(newVal, oldVal) {
    return !isNaN(parseFloat(newVal)) && isFinite(newVal) && newVal > 0 ? newVal : oldVal;
}

let endsWith = (function () {
    if (String.prototype.endsWith) return String.prototype.endsWith;
    return function endsWith (searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
})();

export function stringEndsWith(string, search) {
    return endsWith.call(string, search);
}

export function hideFlashEl(el) {
    // can't use display none or visibility none because will block flash in some browsers
    el.style.position = 'absolute';
    el.style.left = '-1px';
    el.style.top = '-1px';
    el.style.width = '1px';
    el.style.height = '1px';
}
