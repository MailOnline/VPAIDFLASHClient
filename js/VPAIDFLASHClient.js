'use strict';

const JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
const VPAIDAdUnit = require('./VPAIDAdUnit').VPAIDAdUnit;

const noop = require('./utils').noop;
const callbackTimeout = require('./utils').callbackTimeout;
const isPositiveInt = require('./utils').isPositiveInt;
const createElementWithID = require('./utils').createElementWithID;
const uniqueVPAID = require('./utils').unique('vpaid');
const createFlashTester = require('./flashTester.js').createFlashTester;

const ERROR = 'error';
const FLASH_VERSION = '10.1.0';

let flashTester = {isSupported: ()=> true}; // if the runFlashTest is not run the flashTester will always return true

class VPAIDFLASHClient {
    constructor (vpaidParentEl, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, params = { wmode: 'transparent', salign: 'tl', align: 'left', allowScriptAccess: 'always', scale: 'noScale', allowFullScreen: 'true', quality: 'high'}, vpaidOptions = { debug: false, timeout: 10000 }) {

        if (!VPAIDFLASHClient.hasExternalDependencies()) {
            return onError('no swfobject in global scope. check: https://github.com/swfobject/swfobject or https://code.google.com/p/swfobject/');
        }

        this._vpaidParentEl = vpaidParentEl;
        this._flashID = uniqueVPAID();
        this._destroyed = false;
        callback = callback || noop;

        swfConfig.width = isPositiveInt(swfConfig.width, 800);
        swfConfig.height = isPositiveInt(swfConfig.height, 400);

        createElementWithID(vpaidParentEl, this._flashID);

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this._flashID}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}&debug=${vpaidOptions.debug}&salign=${params.salign}`;

        if (!VPAIDFLASHClient.isSupported()) {
            return onError('user don\'t support flash or doesn\'t have the minimum required version of flash ' + FLASH_VERSION);
        }

        this.el = swfobject.createSWF(swfConfig, params, this._flashID);

        if (!this.el) {
            return onError( 'swfobject failed to create object in element' );
        }

        var handler = callbackTimeout(vpaidOptions.timeout,
            (err, data) => {
                $loadPendedAdUnit.call(this);
                callback(err, data);
            }, () => {
                callback('vpaid flash load timeout ' + vpaidOptions.timeout);
            }
        );

        this._flash = new JSFlashBridge(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height, handler);

        function onError(error) {
            setTimeout(() => {
                callback(new Error(error));
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
        delete this._loadLater;

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
        $throwIfDestroyed.call(this);

        if (this._adUnit) {
            this._destroyAdUnit();
        }

        if (this._flash.isReady()) {
            this._adUnitLoad = (err, message) => {
                if (!err) {
                    this._adUnit = new VPAIDAdUnit(this._flash);
                }
                this._adUnitLoad = null;
                callback(err, this._adUnit);
            };

            this._flash.callFlashMethod('loadAdUnit', [adURL], this._adUnitLoad);
        }else {
            this._loadLater = {url: adURL, callback};
        }
    }

    unloadAdUnit(callback = undefined) {
        $throwIfDestroyed.call(this);

        this._destroyAdUnit();
        this._flash.callFlashMethod('unloadAdUnit', [], callback);
    }
    getFlashID() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashID();
    }
    getFlashURL() {
        $throwIfDestroyed.call(this);
        return this._flash.getFlashURL();
    }
}

setStaticProperty('isSupported', () => {
    return VPAIDFLASHClient.hasExternalDependencies() && swfobject.hasFlashPlayerVersion(FLASH_VERSION) && flashTester.isSupported();
});

setStaticProperty('hasExternalDependencies', () => {
    return !!window.swfobject;
});

setStaticProperty('runFlashTest', (swfConfig) => {
    flashTester = createFlashTester(document.body, swfConfig);
});

function $throwIfDestroyed() {
    if(this._destroyed) {
        throw new Error('VPAIDFlashToJS is destroyed!');
    }
}

function $loadPendedAdUnit() {
    if (this._loadLater) {
        this.loadAdUnit(this._loadLater.url, this._loadLater.callback);
        delete this._loadLater;
    }
}

function setStaticProperty(propertyName, value) {
    Object.defineProperty(VPAIDFLASHClient, propertyName, {
        writable: false,
        configurable: false,
        value: value
    });
}

module.exports = VPAIDFLASHClient;
