//if this code already run once don't do anything
let VPAIDFlashJSMediator = (function () {
if (window.FlashVPAID) return;

let JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
let VPAIDCreative = require('./VPAIDCreative').VPAIDCreative;

let noop = require('./utils').noop;
let isPositiveInt = require('./utils').isPositiveInt;
let createElementWithID = require('./utils').createElementWithID;
let uniqueVPAID = require('./utils').unique('vpaid');

const ERROR = 'error';

class VPAIDFlashToJS {
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

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${debug}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this._flashID);
            this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, callback || noop);
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

    loadAdUnit(adURL, callback) {
        if (this._creative) {
            throw new error('creative still exists');
        }

        this._creativeLoad = (err, message) => {
            if (!err) {
                this._creative = new VPAIDCreative(this._flash);
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

window.VPAIDFlashToJS = VPAIDFlashToJS;

return VPAIDFlashToJS;
})();

module.exports =  VPAIDFlashToJS;

