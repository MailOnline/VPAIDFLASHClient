//if this code already run once don't do anything
var FlashVPAID = (function () {
if (window.FlashVPAID) return;

let IFLASH_VPAID = require('./IVPAID').IFLASH_VPAID;
let noop = require('./utils').noop;
let unique = require('./utils').unique;
let isPositiveInt = require('./utils').isPositiveInt;
let createElementWithID = require('./utils').createElementWithID;
let uniqueVPAID = unique('vpaid');
let instances = {};

const ERROR = 'error';
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';


class FlashVPAID extends IFLASH_VPAID {
    constructor (vpaidWrapper, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, version = '9', params = { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always'}, debug = false) {
        super();

        if (!swfobject) return this;

        this._handlers = {};
        this._callbacks = {};
        this._vpaidWrapper = vpaidWrapper;
        this._flashID = uniqueVPAID();
        this._load =  callback || noop;


        //validate the height
        swfConfig.width = isPositiveInt(swfConfig.width, 800);
        swfConfig.height = isPositiveInt(swfConfig.height, 400);

        //cache sizes
        this._width = swfConfig.width;
        this._height = swfConfig.height;


        this._uniqueMethodIdentifier = unique(this._flashID);
        createElementWithID(vpaidWrapper, this._flashID);

        //because flash externalInterface will call
        instances[this._flashID] = this;

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${VPAID_FLASH_HANDLER}&debug=${debug}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this._flashID);
        }

    }

    //internal methods don't call outside of FlashVPAID
    _safeFlashMethod(methodName, args = [], callback = undefined) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            var callbackID = this._uniqueMethodIdentifier();
            this._callbacks[callbackID] = callback;
        }


        try {
            //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
            //this code will throw an error
            this.el[methodName]([callbackID].concat(args));

        } catch (e) {
            if (callback) {
                delete this.callback[callbackID];
                callback(e);
            } else {

                //if there isn't any callback to return error use error event handler
                this._fireEvent(ERROR, [e]);
            }
        }
    }

    _fireEvent(eventName, err, result) {
        //TODO: check if forEach and isArray is added to the browser with babeljs
        if (Array.isArray(this._handlers[eventName])) {
            this._handlers[eventName].forEach(function (callback) {
                setTimeout(function () {
                    callback(err, result);
                }, 0);
            });
        }
    }

    _flash_handShake (error, message) {
        this._load(error, message);
    }

    _flash_methodAnswer(methodName, callbackID, err, result) {

        //not all methods callback's are mandatory
        if (callbackID === '' || !this._callbacks[callbackID]) {
            //but if there exist an error, fire the error event
            if (err) this._fireEvent(ERROR, err, result);
            return;
        }

        this._callbacks[callbackID](err, result);
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

    //methods specific to this implementation of VPAID
    on(eventName, callback) {
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(callback);
    }

    loadAdUnit(adURL, callback) {
        this._safeFlashMethod('loadAdUnit', [adURL], callback);
    }
    unloadAdUnit(callback = undefined) {
        this._safeFlashMethod('unloadAdUnit', [], callback);
    }

    //VPAID methods and properties of VPAID spec
    //async methods
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {
        this._safeFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    }
    initAd (viewMode, desiredBitrate, width = 0, height = 0, creativeData = '', environmentVars = '', callback = undefined) {
        //resize element that has the flash object
        this.size(width, height);

        this._safeFlashMethod('initAd', [this.getWidth(), this.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars], callback);
    }
    resizeAd(width, height, viewMode, callback = undefined) {
        //resize element that has the flash object
        this.size(width, height);

        //resize ad inside the flash
        this._safeFlashMethod('resizeAd', [this.getWidth(), this.getHeight(), viewMode], callback);
    }
    startAd(callback = undefined) {
        this._safeFlashMethod('startAd', [], callback);
    }
    stopAd(callback = undefined) {
        this._safeFlashMethod('stopAd', [], callback);
    }
    pauseAd(callback = undefined) {
        this._safeFlashMethod('pauseAd', [], callback);
    }
    resumeAd(callback = undefined) {
        this._safeFlashMethod('resumeAd', [], callback);
    }
    expandAd(callback = undefined) {
        this._safeFlashMethod('expandAd', [], callback);
    }
    collapseAd(callback = undefined) {
        this._safeFlashMethod('collapseAd', [], callback);
    }
    skipAd(callback = undefined) {
        this._safeFlashMethod('skipAd', [], callback);
    }

    //properties that will be treat as async methods
    adLinear(callback) {
        this._safeFlashMethod('adLinear', [], callback);
    }
    adWidth(callback) {
        this._safeFlashMethod('adWidth', [], callback);
    }
    adHeight(callback) {
        this._safeFlashMethod('adHeight', [], callback);
    }
    adExpanded(callback) {
        this._safeFlashMethod('adExpanded', [], callback);
    }
    adSkippableState(callback) {
        this._safeFlashMethod('adSkippableState', [], callback);
    }
    adRemainingTime(callback) {
        this._safeFlashMethod('adRemainingTime', [], callback);
    }
    adDuration(callback) {
        this._safeFlashMethod('adDuration', [], callback);
    }

    setAdVolume(volume, callback = undefined) {
        this._safeFlashMethod('setAdVolume', [volume], callback);
    }
    getAdVolume(callback) {
        this._safeFlashMethod('getAdVolume', [], callback);
    }

    adCompanions(callback) {
        this._safeFlashMethod('adCompanions', [], callback);
    }
    adIcons(callback) {
        this._safeFlashMethod('adIcons', [], callback);
    }
}

Object.defineProperty(FlashVPAID, 'VPAID_FLASH_HANDLER', {
    writable: false,
    configurable: false,
    value: VPAID_FLASH_HANDLER
});

window[VPAID_FLASH_HANDLER] = (flashID, type, event, callID, error, data) => {
    if (event === 'handShake') {
        instances[flashID]._flash_handShake(error, data);
    } else {
        if (type !== 'event') {
            instances[flashID]._flash_methodAnswer(event, callID, error, data);
        } else {
            instances[flashID]._fireEvent(event, error, data);
        }
    }
}
window.FlashVPAID = FlashVPAID;

return FlashVPAID;
})();

module.exports =  FlashVPAID;

