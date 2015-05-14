//simple representation of the API
export class IVPAID {

    //custom implementation, sync methods
    getWidth() {}
    setWidth(w) {}

    getHeight() {}
    setHeight(h) {}

    getSize() {}
    setSize(width, height) {}


    //all methods below
    //are async methods
    handshakeVersion(callback, playerVPAIDVersion = '2.0') {}

    //width and height is not in the beginning because we will use the default width/height used in the constructor
    initAd ( viewMode : String, desiredBitrate : Number, width = 0, height = 0, creativeData = '', environmentVars = '') {}
    resizeAd(width, height, viewMode) {}

    startAd() {}
    stopAd() {}
    pauseAd() {}
    resumeAd() {}
    expandAd() {}
    collapseAd() {}
    skipAd() {}

    //properties that will be treat as async methods
    adLinear() {}
    adWidth() {}
    adHeight() {}
    adExpanded() {}
    adSkippableState() {}
    adRemainingTime() {}
    adDuration() {}
    setAdVolume(soundVolume) {}
    getAdVolume() {}
    adCompanions() {}
    adIcons() {}
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

