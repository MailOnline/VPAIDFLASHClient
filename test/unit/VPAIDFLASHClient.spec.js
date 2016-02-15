let VPAIDFLASHClient = require('../../js/VPAIDFLASHClient.js');
let VPAID_FLASH_HANDLER = require('../../js/jsFlashBridge.js').JSFlashBridge.VPAID_FLASH_HANDLER;
let VPAIDAdUnit = require('../../js/VPAIDAdUnit.js').VPAIDAdUnit;
let after = require('../testHelper.js').after;
let addFlashMethodsToEl = require('../testHelper.js').addFlashMethodsToEl;


describe('VPAIDFLASHClient.js api', function()  {
    let swfObjectCallback;
    let flashWrapper1, flashWrapper2;
    let noop = function () {};
    var clock;

    beforeEach(function() {
        sinon.stub(VPAIDFLASHClient.swfobject, 'hasFlashPlayerVersion').returns(true);
        swfObjectCallback = sinon.stub(VPAIDFLASHClient.swfobject, 'createSWF', function (config, params, flashID) {
            var el = document.getElementById(flashID);

            //we need to simulate all the methods created by Flash ExternalInterface
            //so we can later spy this methods
            addFlashMethodsToEl(el, flashID);

            setTimeout(function () {
                //simulate flash calling the application
                window[VPAID_FLASH_HANDLER](flashID, '', 'handShake', '', null, 'ok');
            }, 0);

            return el;
        });

        flashWrapper1 = document.createElement('div');
        flashWrapper2 = document.createElement('div');
        document.body.appendChild(flashWrapper1);
        document.body.appendChild(flashWrapper2);

        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        VPAIDFLASHClient.swfobject.hasFlashPlayerVersion.restore();
        VPAIDFLASHClient.swfobject.createSWF.restore();


        document.body.removeChild(flashWrapper1);
        document.body.removeChild(flashWrapper2);

        clock.restore();
    });

    describe('swfobject', function() {

        it('isSupported should return true', function () {
            assert(VPAIDFLASHClient.isSupported());
        });

        it('must handle gracefully when no supported flash', function () {
            VPAIDFLASHClient.swfobject.hasFlashPlayerVersion.restore();

            sinon.stub(VPAIDFLASHClient.swfobject, 'hasFlashPlayerVersion', function () {
                return false;
            });

            let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function (err, result) {
                assert.isNotNull(err);
                assert.match(err.message, /^user don't support flash/);
            });

            clock.tick(100);
        });

        it('must handle gracefully when createSWF fails', function () {
            VPAIDFLASHClient.swfobject.createSWF.restore();

            sinon.stub(VPAIDFLASHClient.swfobject, 'createSWF', function () {
                return;
            });

            let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function (err, result) {
                assert.isNotNull(err);
                assert.match(err.message, /^swfobject failed to create/);
            });

            clock.tick(100);
        });

    });

    it('must fire callback when vpaid flash wrapper is loaded', function () {

        let callback = sinon.spy(function () {
            assert(callback.calledWith(null, 'ok'));
        });

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, callback);

        clock.tick(100);
    });

    it('must create elements with with a unique id', function () {
        let flashVPAID1, flashVPAID2;

        let counter = after(2, function () {
            assert.equal(swfObjectCallback.getCall(0).args[2], flashVPAID1.el.id);
            assert.equal(swfObjectCallback.getCall(1).args[2], flashVPAID2.el.id);
        });

        flashVPAID1 = new VPAIDFLASHClient(flashWrapper1, counter);
        flashVPAID2 = new VPAIDFLASHClient(flashWrapper2, counter);

        clock.tick(100);
    });

    it('must handle multiple load callbacks', function () {
        let flashVPAID1, flashVPAID2, callback1, callback2;

        let counter = after(2, function () {
            assert(callback1.calledOnce);
            assert(callback2.calledOnce);
            assert(callback1.calledWith(null, 'ok'));
            assert(callback2.calledWith(null, 'ok'));
        });

        callback1 = sinon.spy(counter);
        flashVPAID1 = new VPAIDFLASHClient(flashWrapper1, callback1);

        callback2 = sinon.spy(counter);
        flashVPAID2 = new VPAIDFLASHClient(flashWrapper1, callback2);

        clock.tick(100);
    });

    it('must load adUnit', function (done) {

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {

            let callback = sinon.spy(function (error, result) {
                assert(callback.calledOnce);
                assert.instanceOf(result, VPAIDAdUnit, 'callback result must return a adUnit');
                done();
            });

            flashVPAID.loadAdUnit('random.swf', callback);

        });

        clock.tick(100);
    });


    it('must unload adUnit', function () {

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {

            flashVPAID.loadAdUnit('random.swf', function (erro, adUnit) {

                [
                    'getAdLinear',
                    'getAdExpanded'
                ].forEach(function (methodName) {
                    sinon.stub(flashVPAID.el, methodName, function (argsData) {
                        setTimeout( function () {
                            window[VPAID_FLASH_HANDLER](flashVPAID.getFlashID(), 'method', methodName, argsData[0], null, true);
                        }, 0);
                    });
                    adUnit[methodName](noop);
                });

                adUnit.on('AdSizeChange', noop);
                adUnit.on('AdPaused', noop);

                assert.equal(flashVPAID._flash._callbacks.size(), 2);
                assert.equal(flashVPAID._flash._handlers.size(), 2);

                flashVPAID.unloadAdUnit();
                assert.equal(flashVPAID._flash._callbacks.size(), 0, 'must remove all callbacks of adUnit');
                assert.equal(flashVPAID._flash._handlers.size(), 0, 'must remove all adUnit events');

                clock.tick(100);
            });

            clock.tick(100);
        });

        clock.tick(100);
    });

    it('must implement destroy', function () {

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {

            flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                let callback1 = sinon.spy();
                let callback2 = sinon.spy();

                let counter = after(2, function () {
                    assert(!callback1.called);
                    assert(!callback2.called);
                });

                [
                    'getAdLinear',
                    'getAdExpanded'
                ].forEach(function (methodName) {
                    var id = flashVPAID.getFlashID();
                    sinon.stub(flashVPAID.el, methodName, function (argsData) {
                        setTimeout( function () {
                            window[VPAID_FLASH_HANDLER](id, 'method', methodName, argsData[0], null, true);
                            counter();
                        }, 0);
                    });
                    adUnit[methodName](noop);
                });

                adUnit.on('AdSizeChange', callback1);
                adUnit.on('AdPaused', callback2);

                flashVPAID.destroy();

                clock.tick(100);
            });

            clock.tick(100);
        });

        clock.tick(100);
    });

    it('must get the volume', function () {

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {
            flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                sinon.stub(flashVPAID.el, 'getAdVolume', function (argsData) {
                    let callBackID = argsData[0];
                    window[VPAID_FLASH_HANDLER](flashVPAID.getFlashID(), 'method', 'getAdVolume', callBackID, null, 0.8);
                });

                let callback = sinon.spy(function () {
                    assert(callback.calledOnce);
                    assert(callback.calledWith(null, 0.8));
                });

                adUnit.getAdVolume(callback);

                clock.tick(100);
            });

            clock.tick(100);
        });

        clock.tick(100);
    });

    it('must set the volume', function () {

        let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {
            flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                sinon.stub(flashVPAID.el, 'setAdVolume', function (argsData) {
                    window[VPAID_FLASH_HANDLER].apply(null, [flashVPAID.getFlashID(), 'method', 'setAdVolume', null].concat(argsData));
                });

                var callback = sinon.spy(function () {
                    assert(callback.calledOnce, 'was called only once');
                    assert(callback.calledWith(null, 0.5), 'was called with null, and .5');
                });

                adUnit.setAdVolume(0.5, callback);

                clock.tick(100);
            });

            clock.tick(100);
        });

        clock.tick(100);
    });

    (function () {
        let booleanGetters = [
            'getAdLinear',
            'getAdExpanded',
            'getAdSkippableState',
            'getAdRemainingTime',
            'getAdCompanions',
            'getAdIcons'
        ];

        booleanGetters.forEach(function (method) {
            it('must get ' + method, function () {

                let flashVPAID = new VPAIDFLASHClient(flashWrapper1, function () {
                    flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                        let callback1, callback2, elCounter = 0;

                        sinon.stub(flashVPAID.el, method, function (argsData) {
                            window[VPAID_FLASH_HANDLER](flashVPAID.getFlashID(), 'method', method, argsData[0], null, ++elCounter > 1);
                        });

                        let counter = after(2, function () {
                            assert(callback1.calledOnce);
                            assert(callback2.calledOnce);
                            assert(callback1.calledWith(null, false));
                            assert(callback2.calledWith(null, true));
                        });

                        callback1 = sinon.spy(counter);
                        callback2 = sinon.spy(counter);

                        adUnit[method](callback1);
                        adUnit[method](callback2);

                        clock.tick(100);
                    });

                    clock.tick(100);
                });

                clock.tick(100);
            });
        });
    })();
});

