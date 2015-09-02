'use strict';

let IVPAIDAdUnit = require('./IVPAIDAdUnit').IVPAIDAdUnit;
let ALL_VPAID_METHODS = Object.getOwnPropertyNames(IVPAIDAdUnit.prototype).filter(function (property) {
    return ['constructor'].indexOf(property) === -1;
});

export class VPAIDAdUnit extends IVPAIDAdUnit {
    constructor (flash) {
        super();
        this._destroyed = false;
        this._flash = flash;
    }

    _destroy() {
        this._destroyed = true;
        ALL_VPAID_METHODS.forEach((methodName) => {
            this._flash.removeCallbackByMethodName(methodName);
        });
        IVPAIDAdUnit.EVENTS.forEach((event) => {
            this._flash.offEvent(event);
        });

        this._flash = null;
    }

    isDestroyed () {
        return this._destroyed;
    }

    on(eventName, callback) {
        this._flash.on(eventName, callback);
    }

    off(eventName, callback) {
        this._flash.off(eventName, callback);
    }

    //VPAID interface
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {
        this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
    }
    initAd (width, height, viewMode, desiredBitrate, creativeData = {AdParameters: ''}, environmentVars = {flashVars: ''}, callback = undefined) {
        //resize element that has the flash object
        this._flash.setSize(width, height);
        creativeData = creativeData || {AdParameters: ''};
        environmentVars = environmentVars || {flashVars: ''};

        this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData.AdParameters || '', environmentVars.flashVars || ''], callback);
    }
    resizeAd(width, height, viewMode, callback = undefined) {
        //resize element that has the flash object
        this._flash.setSize(width, height);

        //resize ad inside the flash
        this._flash.callFlashMethod('resizeAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode], callback);
    }
    startAd(callback = undefined) {
        this._flash.callFlashMethod('startAd', [], callback);
    }
    stopAd(callback = undefined) {
        this._flash.callFlashMethod('stopAd', [], callback);
    }
    pauseAd(callback = undefined) {
        this._flash.callFlashMethod('pauseAd', [], callback);
    }
    resumeAd(callback = undefined) {
        this._flash.callFlashMethod('resumeAd', [], callback);
    }
    expandAd(callback = undefined) {
        this._flash.callFlashMethod('expandAd', [], callback);
    }
    collapseAd(callback = undefined) {
        this._flash.callFlashMethod('collapseAd', [], callback);
    }
    skipAd(callback = undefined) {
        this._flash.callFlashMethod('skipAd', [], callback);
    }

    //properties that will be treat as async methods
    getAdLinear(callback) {
        this._flash.callFlashMethod('getAdLinear', [], callback);
    }
    getAdWidth(callback) {
        this._flash.callFlashMethod('getAdWidth', [], callback);
    }
    getAdHeight(callback) {
        this._flash.callFlashMethod('getAdHeight', [], callback);
    }
    getAdExpanded(callback) {
        this._flash.callFlashMethod('getAdExpanded', [], callback);
    }
    getAdSkippableState(callback) {
        this._flash.callFlashMethod('getAdSkippableState', [], callback);
    }
    getAdRemainingTime(callback) {
        this._flash.callFlashMethod('getAdRemainingTime', [], callback);
    }
    getAdDuration(callback) {
        this._flash.callFlashMethod('getAdDuration', [], callback);
    }
    setAdVolume(volume, callback = undefined) {
        this._flash.callFlashMethod('setAdVolume', [volume], callback);
    }
    getAdVolume(callback) {
        this._flash.callFlashMethod('getAdVolume', [], callback);
    }
    getAdCompanions(callback) {
        this._flash.callFlashMethod('getAdCompanions', [], callback);
    }
    getAdIcons(callback) {
        this._flash.callFlashMethod('getAdIcons', [], callback);
    }
}

