let VPAIDFlashToJS = require('../js/VPAIDFlashToJS.js');
let VPAID_FLASH_HANDLER = require('../js/jsFlashBridge.js').JSFlashBridge.VPAID_FLASH_HANDLER;
let VPAIDAdUnit = require('../js/VPAIDAdUnit.js').VPAIDAdUnit;
let after = require('./testHelper.js').after;
let addFlashMethodsToEl = require('./testHelper.js').addFlashMethodsToEl;


describe('flashVPAID.js api', function()  {
    let swfObjectCallback;
    let flashWrapper1, flashWrapper2;
    let noop = function () {};

    beforeEach(function() {
        sinon.stub(swfobject, 'hasFlashPlayerVersion').returns(true);
        swfObjectCallback = sinon.stub(swfobject, 'createSWF', function (config, params, flashID) {
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
    });

    afterEach(function () {
        swfobject.hasFlashPlayerVersion.restore();
        swfobject.createSWF.restore();


        document.body.removeChild(flashWrapper1);
        document.body.removeChild(flashWrapper2);
    });

    it('must fire callback when vpaid flash wrapper is loaded', function (done) {

        let callback = sinon.spy(function () {
            assert(callback.calledWith(null, 'ok'));
            done();
        });

        let flashVPAID = new VPAIDFlashToJS(flashWrapper1, callback);

    });

    it('must create elements with with a unique id', function (done) {
        let flashVPAID1, flashVPAID2;

        let counter = after(2, function () {
            assert.equal(swfObjectCallback.getCall(0).args[2], flashVPAID1.el.id);
            assert.equal(swfObjectCallback.getCall(1).args[2], flashVPAID2.el.id);
            done();
        });

        flashVPAID1 = new VPAIDFlashToJS(flashWrapper1, counter);
        flashVPAID2 = new VPAIDFlashToJS(flashWrapper2, counter);

    });

    it('must handle multiple load callbacks', function (done) {
        let flashVPAID1, flashVPAID2, callback1, callback2;

        let counter = after(2, function () {
            assert(callback1.calledOnce);
            assert(callback2.calledOnce);
            assert(callback1.calledWith(null, 'ok'));
            assert(callback2.calledWith(null, 'ok'));
            done();
        });

        callback1 = sinon.spy(counter);
        flashVPAID1 = new VPAIDFlashToJS(flashWrapper1, callback1);

        callback2 = sinon.spy(counter);
        flashVPAID2 = new VPAIDFlashToJS(flashWrapper1, callback2);

    });

    it('must load adUnit', function (done) {

        let flashVPAID = new VPAIDFlashToJS(flashWrapper1, function () {

            let callback = sinon.spy(function (error, result) {
                assert(callback.calledOnce);
                assert.instanceOf(result, VPAIDAdUnit, 'callback result must return a adUnit');
                done();
            });

            flashVPAID.loadAdUnit('random.swf', callback);

        });
    });

    it('must get the volume', function (done) {

        let flashVPAID = new VPAIDFlashToJS(flashWrapper1, function () {
            flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                sinon.stub(flashVPAID.el, 'getAdVolume', function (argsData) {
                    let callBackID = argsData[0];
                    window[VPAID_FLASH_HANDLER](flashVPAID.getFlashID(), 'method', 'getAdVolume', callBackID, null, .8);
                });

                let callback = sinon.spy(function () {
                    assert(callback.calledOnce);
                    assert(callback.calledWith(null, .8));
                    done();
                });

                adUnit.getAdVolume(callback);
            });
        });
    });

    it('must set the volume', function (done) {

        let flashVPAID = new VPAIDFlashToJS(flashWrapper1, function () {
            flashVPAID.loadAdUnit('random.swf', function (error, adUnit) {

                sinon.stub(flashVPAID.el, 'setAdVolume', function (argsData) {
                    window[VPAID_FLASH_HANDLER].apply(null, [flashVPAID.getFlashID(), 'method', 'setAdVolume'].concat(argsData));
                });

                var callback = sinon.spy(function () {
                    assert(callback.calledOnce());
                    assert(callback.calledWith(null, .5));
                    done();
                });

                adUnit.setAdVolume(.5, callback);
              done();
            });
        });

    });

    (function () {
        let booleanGetters = [
            'adLinear',
            'adExpanded',
            'adSkippableState',
            'adRemainingTime',
            'adCompanions',
            'adIcons'
        ];

        booleanGetters.forEach(function (method) {
            it('must get ' + method, function (done) {

                let flashVPAID = new VPAIDFlashToJS(flashWrapper1, function () {
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
                            done();
                        });

                        callback1 = sinon.spy(counter);
                        callback2 = sinon.spy(counter);

                        adUnit[method](callback1);
                        adUnit[method](callback2);

                      done();
                    });
                });

            });
        });
    })();
});

