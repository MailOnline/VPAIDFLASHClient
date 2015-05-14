//simple representation of the API
export class IVPAID {

    //async methods
    handshakeVersion() {}
    initAd () {}
    resizeAd() {}
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
    adVolume() {}
    adCompanions() {}
    adIcons() {}
}

