let VPAIDFlashToJS = require('../../js/VPAIDFlashToJS.js');
let VPAID_FLASH_HANDLER = require('../../js/jsFlashBridge.js').JSFlashBridge.VPAID_FLASH_HANDLER;
let VPAIDAdUnit = require('../../js/VPAIDAdUnit.js').VPAIDAdUnit;
let after = require('../testHelper.js').after;
let addFlashMethodsToEl = require('../testHelper.js').addFlashMethodsToEl;

describe('VPAIDFlashToJS <-> FlashVPAID.swf <-> VPAID_AD.swf', function()  {
    let flashWrapper1, flashWrapper2;
    const AD_URL = 'TestAd.swf';

    beforeEach(function () {
        flashWrapper1 = document.createElement('div');
        flashWrapper2 = document.createElement('div');

        document.body.appendChild(flashWrapper1);
        document.body.appendChild(flashWrapper2);
    });

    afterEach(function () {
        document.body.removeChild(flashWrapper1);
        document.body.removeChild(flashWrapper2);
    });

    it('VPAIDFlashToJS must load FlashVPAID', function(done) {
        let vpaid = new VPAIDFlashToJS(flashWrapper1, function () {
            assert(true);
            done();
        });
    });

    it('VPAIDFlashToJS must loadAdUnit', function(done) {
        let vpaid = new VPAIDFlashToJS(flashWrapper1, function () {
            vpaid.loadAdUnit(AD_URL, function(err, adUnit) {
                assert.isDefined(adUnit);
                done();
            });
        });
    });


    describe('adUnit', function () {
        function createAndLoadVPaid(onLoad) {
            let vpaid = new VPAIDFlashToJS(flashWrapper1, function () {
                vpaid.loadAdUnit(AD_URL, onLoad);
            });
            return vpaid;
        }

        it('adUnit handshake must return version', function(done) {
            let vpaid = createAndLoadVPaid(function (err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    assert.isNull(err);
                    assert.isNumber(parseFloat(result));
                    done();
                });
            });
        });

        it('adUnit initAd must fire adLoaded', function(done) {
            createAndLoadVPaid(function(err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    adUnit.on('AdLoaded', function (err, result) {
                        assert.isNull(err);
                        done();
                    });
                    adUnit.initAd(300, 300, 'normal', -1, '', '');
                });
            });
        });

        it('adUnit initAd must fire adStarted', function(done) {
            createAndLoadVPaid(function(err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    adUnit.on('AdLoaded', function (err, result) {
                        assert.isNull(err);
                        if (!err) startAd();
                    });

                    adUnit.on('AdStarted', function (err, result) {
                        assert.isNull(err);
                        done();
                    });

                    adUnit.initAd(300, 300, 'normal', -1, '', '');

                    function startAd() {
                        adUnit.startAd();
                    }
                });
            });
        });


        describe('adUnit must unload', function (done) {
            it('unload must work when the ad is still loading', function (done) {
                let vpaid = new VPAIDFlashToJS(flashWrapper1, function () {
                    let onAd = sinon.spy();
                    vpaid.loadAdUnit(AD_URL, onAd);
                    vpaid.unloadAdUnit(function (err, result) {
                        assert(!onAd.called);
                        assert.isNull(err);
                        done();
                    });
                });
            });

            it('unload must work when the ad is already loaded', function (done) {
                let vpaid = createAndLoadVPaid(function(err, adUnit) {
                    vpaid.unloadAdUnit(function (err, result) {
                        assert.isNull(err);
                        assert(adUnit._destroyed);
                        assert.isNull(adUnit._flash);
                        done();
                    });
                });
            });
        });

        it('must destroy', function (done) {
            let vpaid = createAndLoadVPaid(function(err, adUnit) {
                vpaid.destroy();
                assert(adUnit._destroyed);
                assert.isNull(adUnit._flash);
                done();
            });
        });

    });

});


