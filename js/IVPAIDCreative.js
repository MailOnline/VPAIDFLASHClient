//simple representation of the API
export class IVPAIDCreative {

    //all methods below
    //are async methods
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {}

    //width and height is not in the beginning because we will use the default width/height used in the constructor
    initAd (viewMode, desiredBitrate, width = 0, height = 0, creativeData = '', environmentVars = '', callback = undefined) {}
    resizeAd(width, height, viewMode, callback = undefined) {}

    startAd(callback = undefined) {}
    stopAd(callback = undefined) {}
    pauseAd(callback = undefined) {}
    resumeAd(callback = undefined) {}
    expandAd(callback = undefined) {}
    collapseAd(callback = undefined) {}
    skipAd(callback = undefined) {}

    //properties that will be treat as async methods
    adLinear(callback) {}
    adWidth(callback) {}
    adHeight(callback) {}
    adExpanded(callback) {}
    adSkippableState(callback) {}
    adRemainingTime(callback) {}
    adDuration(callback) {}
    setAdVolume(soundVolume, callback = undefined) {}
    getAdVolume(callback) {}
    adCompanions(callback) {}
    adIcons(callback) {}
}

Object.defineProperty(IVPAIDCreative, 'EVENTS', {
    writable: false,
    configurable: false,
    value: [
        'AdLoaded',
        'AdStarted',
        'AdStopped',
        'AdSkipped',
        'AdSkippableStateChange',
        'AdSizeChange',
        'AdLinearChange',
        'AdDurationChange',
        'AdExpandedChange',
        'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
        'AdVolumeChange',
        'AdImpression',
        'AdVideoStart',
        'AdVideoFirstQuartile',
        'AdVideoMidpoint',
        'AdVideoThirdQuartile',
        'AdVideoComplete',
        'AdClickThru',
        'AdInteraction',
        'AdUserAcceptInvitation',
        'AdUserMinimize',
        'AdUserClose',
        'AdPaused',
        'AdPlaying',
        'AdLog',
        'AdError'
    ]
});

