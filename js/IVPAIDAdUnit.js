'use strict';

//simple representation of the API
export class IVPAIDAdUnit {

    //all methods below
    //are async methods
    handshakeVersion(playerVPAIDVersion = '2.0', callback = undefined) {}

    //creativeData is an object to be consistent with VPAIDHTML
    initAd (width, height, viewMode, desiredBitrate, creativeData = {AdParameters:''}, environmentVars = {flashVars: ''}, callback = undefined) {}
    resizeAd(width, height, viewMode, callback = undefined) {}

    startAd(callback = undefined) {}
    stopAd(callback = undefined) {}
    pauseAd(callback = undefined) {}
    resumeAd(callback = undefined) {}
    expandAd(callback = undefined) {}
    collapseAd(callback = undefined) {}
    skipAd(callback = undefined) {}

    //properties that will be treat as async methods
    getAdLinear(callback) {}
    getAdWidth(callback) {}
    getAdHeight(callback) {}
    getAdExpanded(callback) {}
    getAdSkippableState(callback) {}
    getAdRemainingTime(callback) {}
    getAdDuration(callback) {}
    setAdVolume(soundVolume, callback = undefined) {}
    getAdVolume(callback) {}
    getAdCompanions(callback) {}
    getAdIcons(callback) {}
}

Object.defineProperty(IVPAIDAdUnit, 'EVENTS', {
    writable: false,
    configurable: false,
    value: [
        'AdLoaded',
        'AdStarted',
        'AdStopped',
        'AdSkipped',
        'AdSkippableStateChange', // VPAID 2.0 new event
        'AdSizeChange', // VPAID 2.0 new event
        'AdLinearChange',
        'AdDurationChange', // VPAID 2.0 new event
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
        'AdInteraction', // VPAID 2.0 new event
        'AdUserAcceptInvitation',
        'AdUserMinimize',
        'AdUserClose',
        'AdPaused',
        'AdPlaying',
        'AdLog',
        'AdError'
    ]
});

