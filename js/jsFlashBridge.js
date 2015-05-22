let unique = require('./utils').unique;
let isPositiveInt = require('./utils').isPositiveInt;
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';
const ERROR = 'error';

let instances = {};

export class JSFlashBridge {
    constructor (el, flashURL, flashID, width, height, loadHandShake) {
        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = {};
        this._callbacks = {};
        this._uniqueMethodIdentifier = unique(this._flashID);
        this._loadHandShake = loadHandShake;

        //because flash externalInterface will call
        instances[this._flashID] = this;
    }

    on(eventName, callback) {
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(callback);
    }

    off(eventName, callback) {
        if (!this._handlers[eventName]) { return; }

        var index = this._handlers[eventName].indexOf(callback);

        if (index < 0) { return; }
        return this._handlers[eventName].splice(index, 1);
    }

    offEvent(eventName) {
        if (!this._handlers[eventName]) { return; }

        return this._handlers[eventName].splice(0, this._handlers[eventName].length);
    }

    offAll() {
        var old = this._handlers;
        this._handlers = {};
        return old;
    }

    callFlashMethod(methodName, args = [], callback = undefined) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            var callbackID = this._uniqueMethodIdentifier();
            this._callbacks[callbackID] = callback;
        }


        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this._el[methodName]([callbackID].concat(args));

        } catch (e) {
            if (callback) {
                delete this._callbacks[callbackID];
                callback(e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._trigger(ERROR, [e]);
            }
        }
    }


    removeCallback(methodName, callback) {
        //TODO: check if keys and find is added to the browser with babeljs
        var key = Object.keys(this._callbacks).find(function (key) {
            return this._callbacks[key] === callback;
        });

        if (!key) {
            return;
        }

        delete this._callbacks[key];
        return callback;
    }

    removeAllCallback() {
        let old = this._callbacks;
        this._callbacks = {};
        return old;
    }

    trigger(eventName, err, result) {
        //TODO: check if forEach and isArray is added to the browser with babeljs
        if (Array.isArray(this._handlers[eventName])) {
            this._handlers[eventName].forEach(function (callback) {
                setTimeout(function () {
                    callback(err, result);
                }, 0);
            });
        }
    }

    callCallback(methodName, callbackID, err, result) {

        //not all methods callback's are mandatory
        if (callbackID === '' || !this._callbacks[callbackID]) {
            //but if there exist an error, fire the error event
            if (err) this.trigger(ERROR, err, result);
            return;
        }

        let callback = this._callbacks[callbackID];
        setTimeout(function () {
            callback(err, result);
        }, 0);

        delete this._callbacks[callbackID];
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
}

Object.defineProperty(JSFlashBridge, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});

window[VPAID_FLASH_HANDLER] = (flashID, type, event, callID, error, data) => {
    if (event === 'handShake') {
        instances[flashID]._loadHandShake(error, data);
    } else {
        if (type !== 'event') {
            instances[flashID].callCallback(event, callID, error, data);
        } else {
            instances[flashID].trigger(event, error, data);
        }
    }
}

