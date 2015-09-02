let JSFlashBridge = require('../../js/jsFlashBridge.js').JSFlashBridge;
let VPAIDAdUnit = require('../../js/VPAIDAdUnit.js').VPAIDAdUnit;
let noop = require('../testHelper.js').noop;

describe('VPAIDAdUnit.js api', function() {
    let adUnit;
    let flash;
    let el;
    const EL_ID = 'hello';

    beforeEach(function() {
        el = document.createElement('div');
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

    it('must implement handshakeVersion', function () {
        let flashMethod = sinon.stub(flash, 'callFlashMethod');
        adUnit.handshakeVersion('1.1', noop);
        assert(flashMethod.calledWith('handshakeVersion', ['1.1'], noop));
    });


    describe('must implement initAd', function() {
        it('should handle when is passed all the arguments', function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');
            adUnit.initAd(100, 200, 'thumbnail', -1, {AdParameters: ''}, {flashVars: ''}, noop);
            assert(flashMethod.calledWith('initAd', [100, 200, 'thumbnail', -1, '', ''], noop));
            assert.equal(el.getAttribute('width'), '100');
            assert.equal(el.getAttribute('height'), '200');
        });

        it('initAd must handle null/undefined/empty creativeData/environmentVars ', function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');

            adUnit.initAd(100, 200, 'thumbnail', -1, {}, {}, noop);
            assert(flashMethod.calledWith('initAd', [100, 200, 'thumbnail', -1, '', ''], noop));

            adUnit.initAd(100, 200, 'thumbnail', -1, null, null, noop);
            assert(flashMethod.calledWith('initAd', [100, 200, 'thumbnail', -1, '', ''], noop));

            adUnit.initAd(100, 200, 'thumbnail', -1, undefined, undefined, noop);
            assert(flashMethod.calledWith('initAd', [100, 200, 'thumbnail', -1, '', ''], noop));
        });

    });

    it('must implement resizeAd', function () {
        let flashMethod = sinon.stub(flash, 'callFlashMethod');
        adUnit.resizeAd(300, 200, 'normal', noop);
        assert(flashMethod.calledWith('resizeAd', [300, 200, 'normal'], noop));
        assert.equal(el.getAttribute('width'), '300');
        assert.equal(el.getAttribute('height'), '200');
    });

    [
        'startAd',
        'stopAd',
        'pauseAd',
        'resumeAd',
        'expandAd',
        'collapseAd',
        'skipAd'
    ].forEach(function (methodName) {
        it('must implement ' + methodName, function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');
            adUnit[methodName](noop);
            assert(flashMethod.calledWith(methodName, [], noop));
        });
    });

    [
        'getAdLinear',
        'getAdWidth',
        'getAdHeight',
        'getAdExpanded',
        'getAdSkippableState',
        'getAdRemainingTime',
        'getAdDuration',
        'getAdVolume',
        'getAdCompanions',
        'getAdIcons'
    ].forEach(function (methodName) {
        it('must implement ' + methodName, function () {
            let flashMethod = sinon.stub(flash, 'callFlashMethod');
            adUnit[methodName](noop);
            assert(flashMethod.calledWith(methodName, [], noop));
        });
    });

    it('must implement setAdVolume', function () {
        let flashMethod = sinon.stub(flash, 'callFlashMethod');
        adUnit.setAdVolume(.5, noop);
        assert(flashMethod.calledWith('setAdVolume', [.5], noop));
    });

});

