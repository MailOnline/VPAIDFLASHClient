'use strict';

let unique = require('./utils').unique;
let isPositiveInt = require('./utils').isPositiveInt;
let stringEndsWith = require('./utils').stringEndsWith;
let SingleValueRegistry = require('./registry').SingleValueRegistry;
let MultipleValuesRegistry = require('./registry').MultipleValuesRegistry;
const registry = require('./jsFlashBridgeRegistry');
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';
const ERROR = 'AdError';

export class JSFlashBridge {
    constructor (el, flashURL, flashID, width, height, loadHandShake) {
        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = new MultipleValuesRegistry();
        this._callbacks = new SingleValueRegistry();
        this._uniqueMethodIdentifier = unique(this._flashID);
        this._ready = false;
        this._handShakeHandler = loadHandShake;

        registry.addInstance(this._flashID, this);
    }

    on(eventName, callback) {
        this._handlers.add(eventName, callback);
    }

    off(eventName, callback) {
        return this._handlers.remove(eventName, callback);
    }

    offEvent(eventName) {
        return this._handlers.removeByKey(eventName);
    }

    offAll() {
        return this._handlers.removeAll();
    }

    callFlashMethod(methodName, args = [], callback = undefined) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            callbackID = `${this._uniqueMethodIdentifier()}_${methodName}`;
            this._callbacks.add(callbackID, callback);
        }


        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this._el[methodName]([callbackID].concat(args));

        } catch (e) {
            if (callback) {
                $asyncCallback.call(this, callbackID, e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._trigger(ERROR, e);
            }
        }
    }

    removeCallback(callback) {
        return this._callbacks.removeByValue(callback);
    }

    removeCallbackByMethodName(suffix) {
        this._callbacks.filterKeys((key) => {
            return stringEndsWith(key, suffix);
        }).forEach((key) => {
            this._callbacks.remove(key);
        });
    }

    removeAllCallbacks() {
        return this._callbacks.removeAll();
    }

    _trigger(eventName, event) {
        this._handlers.get(eventName).forEach((callback) => {
            //clickThru has to be sync, if not will be block by the popupblocker
            if (eventName === 'AdClickThru') {
                callback(event);
            } else {
                setTimeout(() => {
                    if (this._handlers.get(eventName).length > 0) {
                        callback(event);
                    }
                }, 0);
            }
        });
    }

    _callCallback(methodName, callbackID, err, result) {

        let callback = this._callbacks.get(callbackID);

        //not all methods callback's are mandatory
        //but if there exist an error, fire the error event
        if (!callback) {
            if (err && callbackID === '') {
                this.trigger(ERROR, err);
            }
            return;
        }

        $asyncCallback.call(this, callbackID, err, result);

    }

    _handShake(err, data) {
        this._ready = true;
        if (this._handShakeHandler) {
            this._handShakeHandler(err, data);
            delete this._handShakeHandler;
        }
    }

    //methods like properties specific to this implementation of VPAID
    getSize() {
        return {width: this._width, height: this._height};
    }
    setSize(newWidth, newHeight) {
        this._width = isPositiveInt(newWidth, this._width);
        this._height = isPositiveInt(newHeight, this._height);
        this._el.setAttribute('width', this._width);
        this._el.setAttribute('height', this._height);
    }
    getWidth() {
        return this._width;
    }
    setWidth(newWidth) {
        this.setSize(newWidth, this._height);
    }
    getHeight() {
        return this._height;
    }
    setHeight(newHeight) {
        this.setSize(this._width, newHeight);
    }
    getFlashID() {
        return this._flashID;
    }
    getFlashURL() {
        return this._flashURL;
    }
    isReady() {
        return this._ready;
    }
    destroy() {
        this.offAll();
        this.removeAllCallbacks();
        registry.removeInstanceByID(this._flashID);
        if (this._el.parentElement) {
            this._el.parentElement.removeChild(this._el);
        }
    }
}

function $asyncCallback(callbackID, err, result) {
    setTimeout(() => {
        let callback = this._callbacks.get(callbackID);
        if (callback) {
            this._callbacks.remove(callbackID);
            callback(err, result);
        }
    }, 0);
}

Object.defineProperty(JSFlashBridge, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});

/**
 * External interface handler
 *
 * @param {string} flashID identifier of the flash who call this
 * @param {string} typeID what type of message is, can be 'event' or 'callback'
 * @param {string} typeName if the typeID is a event the typeName will be the eventName, if is a callback the typeID is the methodName that is related this callback
 * @param {string} callbackID only applies when the typeID is 'callback', identifier of the callback to call
 * @param {object} error error object
 * @param {object} data
 */
window[VPAID_FLASH_HANDLER] = (flashID, typeID, typeName, callbackID, error, data) => {
    let instance = registry.getInstanceByID(flashID);
    if (!instance) return;
    if (typeName === 'handShake') {
        instance._handShake(error, data);
    } else {
        if (typeID !== 'event') {
            instance._callCallback(typeName, callbackID, error, data);
        } else {
            instance._trigger(typeName, data);
        }
    }
};

