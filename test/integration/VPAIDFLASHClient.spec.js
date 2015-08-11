let VPAIDFLASHClient = require('../../js/VPAIDFLASHClient.js');
let VPAID_FLASH_HANDLER = require('../../js/jsFlashBridge.js').JSFlashBridge.VPAID_FLASH_HANDLER;
let VPAIDAdUnit = require('../../js/VPAIDAdUnit.js').VPAIDAdUnit;
let addFlashMethodsToEl = require('../testHelper.js').addFlashMethodsToEl;

describe('VPAIDFLASHClient <-> FlashVPAID.swf <-> VPAID_AD.swf', function()  {
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


    it('must handle gracefully when createSWF fails', function () {
        var elNotInDOM = document.createElement('div');
        let vpaid = new VPAIDFLASHClient(elNotInDOM, function (err, result) {
            assert.isNotNull(err);
            assert.match(err.message, /^swfobject failed to create/);
        });

    });

    it('VPAIDFLASHClient must load FlashVPAID', function(done) {
        let vpaid = new VPAIDFLASHClient(flashWrapper1, function () {
            assert(true);
            done();
        });
    });

    it('VPAIDFLASHClient must loadAdUnit', function(done) {
        let vpaid = new VPAIDFLASHClient(flashWrapper1, function () {
            vpaid.loadAdUnit(AD_URL, function(err, adUnit) {
                assert.isDefined(adUnit);
                done();
            });
        });
    });

    it('must allow to load adUnit even if the flash is not loaded', function(done) {
        let vpaid = new VPAIDFLASHClient(flashWrapper1);

        let callback = sinon.spy(function (err, result) {
            assert.isNull(err);
            assert(callback.calledOnce);
            assert.instanceOf(result, VPAIDAdUnit, 'callback result must return a adUnit');
            done();
        });

        vpaid.loadAdUnit(AD_URL, callback);
    });

    it('must allow to load adUnit even if the flash is not loaded, but should only call the lastest one', function(done) {
        let vpaid = new VPAIDFLASHClient(flashWrapper1);

        let callback1 = sinon.spy();

        let callback2 = sinon.spy(function (err, result) {
            assert.isNull(err);
            assert.equal(callback1.callCount, 0);
            assert(callback2.calledOnce);
            assert.instanceOf(result, VPAIDAdUnit, 'callback result must return a adUnit');
            done();
        });

        vpaid.loadAdUnit(AD_URL, callback1);
        vpaid.loadAdUnit(AD_URL, callback2);
    });

    describe('adUnit', function () {
        function createAndLoadVPaid(onLoad) {
            let vpaid = new VPAIDFLASHClient(flashWrapper1, function () {
                vpaid.loadAdUnit(AD_URL, onLoad);
            });
            return vpaid;
        }

        function createLoadAndStartVPaid(onStart) {
            let vpaid = createAndLoadVPaid(function (err, adUnit) {
                adUnit.handshakeVersion('2.0', function(err, result) {
                    adUnit.on('AdLoaded', function (result) {
                        adUnit.startAd();
                    });
                    adUnit.on('AdStarted', function () {
                        onStart(adUnit);
                    });
                    adUnit.initAd(300, 300, 'normal', -1, '', '');
                });
            });
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
                    adUnit.on('AdLoaded', function () {
                        done();
                    });
                    adUnit.initAd(300, 300, 'normal', -1, '', '');
                });
            });
        });

        it('adUnit initAd must fire adStarted', function(done) {
            createAndLoadVPaid(function(err, adUnit) {
                adUnit.handshakeVersion('2.0', function (err, result) {
                    adUnit.on('AdLoaded', function (result) {
                        startAd();
                    });

                    adUnit.on('AdStarted', function (result) {
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
                let vpaid = new VPAIDFLASHClient(flashWrapper1, function () {
                    let onAd = sinon.spy();
                    vpaid.loadAdUnit(AD_URL, onAd);
                    vpaid.unloadAdUnit(function (err, adUnit) {
                        assert(!onAd.called);
                        assert.isNull(err);
                        assert.isNotNull(adUnit);
                        done();
                    });
                });
            });

            it('must unload previous adUnit when the request to load another adUnit', function (done) {
                let vpaid = new VPAIDFLASHClient(flashWrapper1, function () {
                    let onAd = sinon.spy();
                    vpaid.loadAdUnit(AD_URL, function(err, firstAdUnit) {
                        assert.isNull(err);

                        vpaid.loadAdUnit(AD_URL, function(err, secondAdUnit) {
                            assert.isNull(err);
                            assert(firstAdUnit.isDestroyed());
                            assert(!secondAdUnit.isDestroyed());
                        });
                    });

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

            it('unload must remove pending loading', function() {
                let vpaid = new VPAIDFLASHClient(flashWrapper1);
                vpaid.loadAdUnit(AD_URL, sinon.spy());
                assert.isObject(vpaid._loadLater);
                vpaid.unloadAdUnit();
                assert.isUndefined(vpaid._loadLater);
            });
        });

        describe('destroy', function() {
            it('must destroy', function (done) {
                let vpaid = createAndLoadVPaid(function(err, adUnit) {
                    vpaid.destroy();
                    assert(adUnit._destroyed);
                    assert.isNull(adUnit._flash);
                    done();
                });
            });

            it('must destroy', function () {
                let vpaid = new VPAIDFLASHClient(flashWrapper1);
                vpaid.loadAdUnit(AD_URL, sinon.spy());
                assert.isObject(vpaid._loadLater);
                vpaid.destroy();
                assert(vpaid.isDestroyed());
                assert.isUndefined(vpaid._loadLater);
            });
        });


        it('must get/set volume', function(done) {
            let vpaid = createLoadAndStartVPaid(function (adUnit) {
                const newVolume = .84;

                adUnit.setAdVolume(newVolume, function () {
                    adUnit.getAdVolume(function (err, volume) {
                        assert.equal(newVolume, volume);
                        done();
                    });
                });
            });
        });

        it('must resize the ad', function(done) {
            let vpaid = createLoadAndStartVPaid(function (adUnit) {
                var callback = sinon.spy(function() {
                    done();
                });
                adUnit.resizeAd(300, 200, 'normal', callback);
            });
        });

        [
            'getAdLinear',
            'getAdExpanded',
            'getAdSkippableState',
            'getAdRemainingTime',
            'getAdCompanions',
            'getAdIcons',
            'getAdWidth',
            'getAdHeight'
        ].forEach(function (getter) {
            it('must get ' + getter, function (done) {
                let vpaid = createLoadAndStartVPaid(function (adUnit) {
                    adUnit[getter](function (err, value) {
                        assert.equal(value, false);
                        assert.isNull(err);
                        done();
                    });
                });
            });
        });
    });

});


