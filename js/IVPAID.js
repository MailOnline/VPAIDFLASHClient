//simple representation of the API
export class IVPAID {

    //custom implementation, sync methods
    getSize() {}
    setSize(width, height) {}
    getWidth() {}
    setWidth(w) {}
    getHeight() {}
    setHeight(h) {}

    getFlashID() {}

    on(eventName, callback) {}

    loadAdUnit(callback, adURL) {}
    unloadAdUnit(callback) {}

    //all methods below
    //are async methods
    handshakeVersion(playerVPAIDVersion = '2.0', callback=undefined) {}

    //width and height is not in the beginning because we will use the default width/height used in the constructor
    initAd (viewMode, desiredBitrate, width = 0, height = 0, creativeData = '', environmentVars = '') {}
    resizeAd(width, height, viewMode) {}

    startAd() {}
    stopAd() {}
    pauseAd() {}
    resumeAd() {}
    expandAd() {}
    collapseAd() {}
    skipAd() {}

    //properties that will be treat as async methods
    adLinear(callback) {}
    adWidth(callback) {}
    adHeight(callback) {}
    adExpanded(callback) {}
    adSkippableState(callback) {}
    adRemainingTime(callback) {}
    adDuration(callback) {}
    setAdVolume(soundVolume) {}
    getAdVolume(callback) {}
    adCompanions(callback) {}
    adIcons(callback) {}
}

/*
Events that can be subscribed
AdLoaded
AdStarted
AdStopped
AdSkipped
AdSkippableStateChange
AdSizeChange
AdLinearChange
AdDurationChange
AdExpandedChange
AdRemainingTimeChange [Deprecated in 2.0] but will be still fired for backwards compatibility
AdVolumeChange
AdImpression
AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile,
AdVideoComplete
AdClickThru
AdInteraction
AdUserAcceptInvitation, AdUserMinimize, AdUserClose
AdPaused, AdPlaying
AdLog
AdError
*/

