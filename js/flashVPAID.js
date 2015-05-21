//if this code already run once don't do anything
let FlashVPAID = (function () {
if (window.FlashVPAID) return;

let FlashWrapper = require('./flashWrapper').FlashWrapper;
let Creative = require('./creative').Creative;

let noop = require('./utils').noop;
let isPositiveInt = require('./utils').isPositiveInt;
let createElementWithID = require('./utils').createElementWithID;
let uniqueVPAID = require('./utils').unique('vpaid');
let instances = {};

const ERROR = 'error';
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

class FlashVPAID {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, version = '9', params = { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always'}, debug = true) {
        if (!swfobject) throw new Error('no swfobject in global scope. check: https://github.com/swfobject/swfobject or https://code.google.com/p/swfobject/');

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._load =  callback || noop;
        this._destroyed = false;


        //validate the height
        swfConfig.width = isPositiveInt(swfConfig.width, 800);
        swfConfig.height = isPositiveInt(swfConfig.height, 400);

        createElementWithID(vpaidParentEl, this._flashID);

        //because flash externalInterface will call
        instances[this._flashID] = this;

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${VPAID_FLASH_HANDLER}&debug=${debug}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this._flashID);
            this._flash = new FlashWrapper(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height);
        }

    }

    destroy () {
        this._flash.offAll();
        this._flash.removeAllCallbacks();
        this._flash = null;
        this.vpaidParentEl.removeChild(this.el);
        this.el = null;
        this._creativeLoad = null;
        delete instances[this._flashID];
        this._destroyed = true;
    }

    isDestroyed () {
        return this._destroyed;
    }

    _flash_handShake (error, message) {
        this._load(error, message);
    }

    loadAdUnit(adURL, callback) {
        if (this._creative) {
            throw new error('creative still exists');
        }

        this._creativeLoad = (err, message) => {
            if (!err) {
                this._creative = new Creative(this._flash);
            }
            this._creativeLoad = null;
            callback(err, this._creative);
        };

        this._flash.callFlashMethod('loadAdUnit', [adURL], this._creativeLoad);
    }
    unloadAdUnit(callback = undefined) {
        if (!this._creative) {
            throw new Error("Can't unload a creative that doesn't exist");
        }

        this._creative = null;

        if (this._creativeLoad) {
            this._flash.removeCallback(this._creativeLoad);
            this._creativeLoad = null;
        }

        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    }
    getFlashID() {
        return this._flash.getFlashID();
    }
    getFlashURL() {
        return this._flash.getFlashURL();
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
            instances[flashID]._flash.callCallback(event, callID, error, data);
        } else {
            instances[flashID]._flash.trigger(event, error, data);
        }
    }
}
window.FlashVPAID = FlashVPAID;

return FlashVPAID;
})();

module.exports =  FlashVPAID;

