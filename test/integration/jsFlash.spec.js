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

    it('VPAIDFlashToJS should load FlashVPAID', function(done) {
        let vpaid = new VPAIDFlashToJS(flashWrapper1, function () {
            assert(true);
            done();
        });
    });

    it('VPAIDFlashToJS should loadAdUnit', function(done) {
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

        it('adUnit handshake should return version', function(done) {
            let vpaid = createAndLoadVPaid(function (err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    assert.isNull(err);
                    assert.isNumber(parseFloat(result));
                    done();
                });
            });
        });

        it('adUnit initAd should fire adLoaded', function(done) {
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

        it('adUnit initAd should fire adStarted', function(done) {
            createAndLoadVPaid(function(err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    adUnit.on('AdLoaded', function (err, result) {
                        assert.isNull(err);
                        if (!err) startAd();
                    });

                    adUnit.on('AdLoaded', function (err, result) {
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

    });

});


