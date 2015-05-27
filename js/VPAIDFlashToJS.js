//if this code already run once don't do anything
let VPAIDFlashToJS = (function () {
if (window.VPAIDFlashToJS) return;

let JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
let VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;

let noop = require('./utils').noop;
let isPositiveInt = require('./utils').isPositiveInt;
let createElementWithID = require('./utils').createElementWithID;
let uniqueVPAID = require('./utils').unique('vpaid');

const ERROR = 'error';

class VPAIDFlashToJS {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, version = '9', params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'}, debug = false) {

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
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${debug}&salign=${params.salign}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this._flashID);
            this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, callback || noop);
        }

    }

    destroy () {
        this._flash.destroy();
        this._flash = null;
        this.el = null;
        this._adUnitLoad._destroy();
        this._adUnitLoad = null;
        this._destroyed = true;
    }

    isDestroyed () {
        return this._destroyed;
    }

    loadAdUnit(adURL, callback) {
        if (this._adUnit) {
            throw new error('AdUnit still exists');
        }

        this._adUnitLoad = (err, message) => {
            if (!err) {
                this._adUnit = new VPAIDAdUnit(this._flash);
            }
            this._adUnitLoad = null;
            callback(err, this._adUnit);
        };

        this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
    }
    unloadAdUnit(callback = undefined) {
        if (!this._adUnit) {
            throw new Error("Can't unload a adUnit that doesn't exist");
        }

        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        this._adUnit._destroy();
        this._adUnit = null;

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

