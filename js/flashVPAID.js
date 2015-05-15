//if this code already run once don't do anything
(function () {
if (window.FlashVPAID) return;

let IVPAID = require('./IVPAID').IVPAID;
let noop = require('./utils').noop;
let unique = require('./utils').unique;
let uniqueVPAID = unique('vpaid');
let instances = {};
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

function createElementWithID(parent, id) {
    var nEl = document.createElement('div');
    nEl.id = id;
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

class FlashVPAID extends IVPAID {
    constructor (vpaidWrapper, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, version = '9', params = { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always'}, debug = false) {
        super();
        this._handlers = {};
        this._callbacks = {};

        this.vpaidWrapper = vpaidWrapper;
        this.flashID = uniqueVPAID();
        this.load =  callback || noop;
        this._uniqueMethodIdentifier = unique(this.flashID);
        createElementWithID(vpaidWrapper, this.flashID);

        //because flash externalInterface will call
        instances[this.flashID] = this;

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this.flashID}&handler=${VPAID_FLASH_HANDLER}&debug=${debug}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this.flashID);
        }

        //if this.el is undefined means swfobject failed to create the swfobject
        if (!this.el) return this;
    }

    _safeFlashMethod(methodName, args = [], callbacks = undefined) {
        var callbackID = '';
        // if no callback, some methods the return is void so they don't need callback
        if (callback) {
            var callbackID = this.uniqueMethodIdentifier();
            this._callbacks[callbackID] = callback;
        }

        try {
            this.el[methodName].call(this, [this.flashID, methodName, callbackID].concat(args));

        } catch (e) {
            if (callback) {
                delete this.callback[callbackID];
                callback(e);
            } else {

                //if there isn't any callback to return error use error event handler
                _fireEvent('error', [e]);
            }
        }
    }

    _flashMethodAnswer(methodName, callbackID, args) {

        //method's that return void will not have callbacks
        if (callbackID === '') return;

        if (!this._callbacks[callbackID]) {
            //TODO: something is wrong, this should never happens if it happens fire an error
            return;
        }

        //TODO: check with carlos if we need to use apply instead
        this._callbacks[callbackID](args);
        delete this._callbacks[callbackID];
    }

    _fireEvent(eventName, args) {
        //TODO: check if forEach and isArray is added to the browser with babeljs
        if (Array.isArray(this._handlers[eventName])) {
            this._handlers[eventName].forEach(function (callback) {
                setTimeout(function () {
                    callback(args);
                }, 0);
            });
        }
    }

    on(eventName, callback) {
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(callback);
    }

    //async methods
    handshakeVersion(callback, playerVPAIDVersion = '2.0') {
        _safeFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    }

    initAd (viewMode, desiredBitrate, width = 0, height = 0, creativeData = '', environmentVars = '') {
        this.size(width, height);
        _safeFlashMethod('initAd', [this.getWidth(), this.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars]);
    }

    resizeAd(width, height, viewMode) {
        this.size(width, height);
        _safeFlashMethod('resizeAd', [this.getWidth(), this.getHeight(), viewMode]);
    }

    startAd() {
        _safeFlashMethod('startAd');
    }
    stopAd() {
        _safeFlashMethod('stopAd');
    }
    pauseAd() {
        _safeFlashMethod('pauseAd');
    }
    resumeAd() {
        _safeFlashMethod('resumeAd');
    }
    expandAd() {
        _safeFlashMethod('expandAd');
    }
    collapseAd() {
        _safeFlashMethod('collapseAd');
    }
    skipAd() {
        _safeFlashMethod('skipAd');
    }

    //properties that will be treat as async methods
    adLinear(callback) {
        _safeFlashMethod('adLinear', [], callback);
    }
    adWidth(callback) {
        _safeFlashMethod('adWidth', [], callback);
    }
    adHeight(callback) {
        _safeFlashMethod('adHeight', [], callback);
    }
    adExpanded(callback) {
        _safeFlashMethod('adExpanded', [], callback);
    }
    adSkippableState(callback) {
        _safeFlashMethod('adSkippableState', [], callback);
    }
    adRemainingTime(callback) {
        _safeFlashMethod('adRemainingTime', [], callback);
    }
    adDuration(callback) {
        _safeFlashMethod('adDuration', [], callback);
    }
    //TODO: in flash we need to convert setAdVolume to a setter
    setAdVolume(volume) {
        _safeFlashMethod('setAdVolume', [volume]);
    }
    //TODO: in flash we need to convert getAdVolume to a getter
    getAdVolume(callback) {
        _safeFlashMethod('getAdVolume', [], callback);
    }
    adCompanions(callback) {
        _safeFlashMethod('adCompanions', [], callback);
    }
    adIcons(callback) {
        _safeFlashMethod('adIcons', [], callback);
    }

    _flash_handShake (message) {
        console.log('handShake:', message);
        if (message == 'prepared') {
            this.load();
        }
    }

}

window[VPAID_FLASH_HANDLER] = function (flashID, event, message) {
    console.log('flashID', flashID, 'event', event, 'message', message);
    //console.log(instances[flashID], instances[flashID]['_flash_']);
    instances[flashID]['_flash_' + event](message);
}
window.FlashVPAID = FlashVPAID;

})();

