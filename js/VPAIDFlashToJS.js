//if this code already run once don't do anything
let VPAIDFlashToJS = (function () {
if (window.VPAIDFlashToJS) return;

let JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
let VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;

let noop = require('./utils').noop;
let callbackTimeout = require('./utils').callbackTimeout;
let isPositiveInt = require('./utils').isPositiveInt;
let createElementWithID = require('./utils').createElementWithID;
let uniqueVPAID = require('./utils').unique('vpaid');

const ERROR = 'error';
const FLASH_VERSION = '10.1.0';

class VPAIDFlashToJS {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'}, vpaidOptions = { debug: false, timeout: 10000 }) {

        if (!swfobject) {
            return onError({msg: 'no swfobject in global scope. check: https://github.com/swfobject/swfobject or https://code.google.com/p/swfobject/'});
        }

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._destroyed = false;

        //validate the height
        swfConfig.width = isPositiveInt(swfConfig.width, 800);
        swfConfig.height = isPositiveInt(swfConfig.height, 400);

        createElementWithID(vpaidParentEl, this._flashID);

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${vpaidOptions.debug}&salign=${params.salign}`;

        if (!VPAIDFlashToJS.isSupported()) {
            return onError({msg:'user don\'t support flash or doesn\'t have the minimum required version of flash', version: FLASH_VERSION});
        }

        this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
            return onError({msg: 'swfobject failed to create object in element'});
        }

        this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, callbackTimeout(vpaidOptions.timeout, callback, () => {
            callback({msg: 'vpaid flash load timeout', timeout: vpaidOptions.timeout });
        }));

        function onError(error) {
            setTimeout(() => {
                callback(error);
            }, 0);
            return this;
        }

    }

    destroy () {
        this._destroyAdUnit();
        if (this._flash) {
            this._flash.destroy();
            this._flash = null;
        }
        this.el = null;
        this._destroyed = true;
    }

    isDestroyed () {
        return this._destroyed;
    }

    _destroyAdUnit() {
        if (this._adUnitLoad) {
            this._adUnitLoad = null;
            this._flash.removeCallback(this._adUnitLoad);
        }

        if (this._adUnit) {
            this._adUnit._destroy();
            this._adUnit = null;
        }
    }

    loadAdUnit(adURL, callback) {
        if (this._destroyed) {
            throw new error('VPAIDFlashToJS is destroyed!');
        }
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
        if (this._destroyed) {
            throw new error('VPAIDFlashToJS is destroyed!');
        }

        this._destroyAdUnit();
        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    }
    getFlashID() {
        return this._flash.getFlashID();
    }
    getFlashURL() {
        return this._flash.getFlashURL();
    }
}

Object.defineProperty(VPAIDFlashToJS, 'isSupported', {
    writable: false,
    configurable: false,
    value: () => {
        return swfobject.hasFlashPlayerVersion(FLASH_VERSION);
    }
});

window.VPAIDFlashToJS = VPAIDFlashToJS;

return VPAIDFlashToJS;
})();

module.exports =  VPAIDFlashToJS;

