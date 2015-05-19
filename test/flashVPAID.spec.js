let FlashVPAID = require('../js/flashVPAID.js');

describe('flashVPAID api', function()  {
    var swfObjectCallback;
    var flashWrapper1, flashWrapper2;
    var noop = function () {};

    beforeEach(function() {
        sinon.stub(swfobject, 'hasFlashPlayerVersion').returns(true);
        swfObjectCallback = sinon.stub(swfobject, 'createSWF', function (config, params, flashID) {
            return document.getElementById(flashID);
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

    it('must create elements with with a unique id', function () {
        let flashVPAID1 = new FlashVPAID(flashWrapper1, noop);

        assert.equal(swfObjectCallback.getCall(0).args[2], flashVPAID1.el.id);

        let flashVPAID2 = new FlashVPAID(flashWrapper2, noop);

        assert.equal(swfObjectCallback.getCall(1).args[2], flashVPAID2.el.id);
    });

    it('must create in global a function in global scope', function () {

        let flashVPAID = new FlashVPAID(flashWrapper1, noop);

        assert.isFunction(window[FlashVPAID.VPAID_FLASH_HANDLER]);

    });

    it('must fire callback when vpaid flash wrapper is loaded', function () {

        var callback = sinon.spy();
        let flashVPAID = new FlashVPAID(flashWrapper1, callback);
        window[FlashVPAID.VPAID_FLASH_HANDLER](flashVPAID.getFlashID(), '', 'handShake', '', null, 'ok');

        assert(callback.called);
        assert(callback.calledWith(null, 'ok'));

    });


    it('must handle multiple load callbacks', function () {
        var callback1 = sinon.spy();
        let flashVPAID1 = new FlashVPAID(flashWrapper1, callback1);

        var callback2 = sinon.spy();
        let flashVPAID2 = new FlashVPAID(flashWrapper1, callback2);

        window[FlashVPAID.VPAID_FLASH_HANDLER](flashVPAID1.getFlashID(), '', 'handShake', '', null, 'ok');
        window[FlashVPAID.VPAID_FLASH_HANDLER](flashVPAID2.getFlashID(), '', 'handShake', '', null, 'prepared');

        assert(callback1.calledOnce);
        assert(callback2.calledOnce);
        assert(callback1.calledWith(null, 'ok'));
        assert(callback2.calledWith(null, 'prepared'));
    });


});

