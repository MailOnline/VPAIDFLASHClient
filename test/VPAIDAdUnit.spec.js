let JSFlashBridge = require('../js/jsFlashBridge.js').JSFlashBridge;
let VPAIDAdUnit = require('../js/VPAIDAdUnit.js').VPAIDAdUnit;
let noop = require('./testHelper.js').noop;

describe('VPAIDAdUnit.js api', function() {
    let adUnit;
    let flash;
    const EL_ID = 'hello';

    beforeEach(function() {
        let el = document.createElement('div');
        flash = new JSFlashBridge(el, '', EL_ID, 10, 10, noop);
        adUnit = new VPAIDAdUnit(flash);
    });

    [
        'on',
        'off'
    ].forEach(function (methodName) {
        it('must implement ' + methodName, function () {
            let flashMethod = sinon.stub(flash, methodName);
            let randomEvent = 'randomEvent';
            adUnit[methodName](randomEvent, noop);
            assert(flashMethod.calledWith(randomEvent, noop));
        });
    });

    [
        'startAd',
        'stopAd',
        'pauseAd',
        'resumeAd',
        'expandAd',
        'collapseAd',
        'skipAd',
        'adLinear',
        'skipAd'
    ].forEach(function (methodName) {
        it('must implement ' + methodName, function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');
            adUnit[methodName](noop);
            assert(flashMethod.calledWith(methodName, [], noop));
        });
    });


    [
        'adLinear',
        'adWidth',
        'adHeight',
        'adExpanded',
        'adSkippableState',
        'adRemainingTime',
        'adDuration',
        'getAdVolume',
        'adCompanions',
        'adIcons'
    ].forEach(function (methodName) {
        it('must implement ' + methodName, function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');
            adUnit[methodName](noop);
            assert(flashMethod.calledWith(methodName, [], noop));
        });
    });

});

