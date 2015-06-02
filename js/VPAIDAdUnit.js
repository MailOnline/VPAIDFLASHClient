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
    initAd (width, height, viewMode, desiredBitrate, creativeData = '', environmentVars = '', callback = undefined) {
        //resize element that has the flash object
        this._flash.setSize(width, height);

        this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars], callback);
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
    adLinear(callback) {
        this._flash.callFlashMethod('adLinear', [], callback);
    }
    adWidth(callback) {
        this._flash.callFlashMethod('adWidth', [], callback);
    }
    adHeight(callback) {
        this._flash.callFlashMethod('adHeight', [], callback);
    }
    adExpanded(callback) {
        this._flash.callFlashMethod('adExpanded', [], callback);
    }
    adSkippableState(callback) {
        this._flash.callFlashMethod('adSkippableState', [], callback);
    }
    adRemainingTime(callback) {
        this._flash.callFlashMethod('adRemainingTime', [], callback);
    }
    adDuration(callback) {
        this._flash.callFlashMethod('adDuration', [], callback);
    }

    setAdVolume(volume, callback = undefined) {
        this._flash.callFlashMethod('setAdVolume', [volume], callback);
    }
    getAdVolume(callback) {
        this._flash.callFlashMethod('getAdVolume', [], callback);
    }

    adCompanions(callback) {
        this._flash.callFlashMethod('adCompanions', [], callback);
    }
    adIcons(callback) {
        this._flash.callFlashMethod('adIcons', [], callback);
    }
}

