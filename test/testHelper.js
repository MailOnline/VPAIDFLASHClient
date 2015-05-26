let IVPAIDAdUnit = require('../js/IVPAIDAdUnit.js').IVPAIDAdUnit;
const VPAID_FLASH_HANDLER = require('../js/jsFlashBridge.js').JSFlashBridge.VPAID_FLASH_HANDLER;
const ALL_VPAID_METHODS = ['loadAdUnit', 'unloadAdUnit'].concat(Object.getOwnPropertyNames(IVPAIDAdUnit.prototype).filter(function (property) {
    return ['constructor'].indexOf(property) === -1;
}));

export function after(count, handler) {
    return function () {
        count--;
        if (count <= 0) {
            handler();
        }
    };
}

export function addFlashMethodsToEl(el, flashID) {
    //we need to simulate all the methods created by Flash ExternalInterface
    //so we can later spy this methods
    ALL_VPAID_METHODS.forEach(function (method) {
        el[method] = function (argsData) {
            let callBackID = argsData[0];
            setTimeout(function () {
                window[VPAID_FLASH_HANDLER](flashID, 'method', method, callBackID, null, 'ok');
            }, 0);
        }
    });
}

export function noop() {}

