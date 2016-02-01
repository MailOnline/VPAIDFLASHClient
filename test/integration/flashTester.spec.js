'use strict';

const FLASH_TEST = 'vpaid_video_flash_tester';
const FLASH_TEST_EL = 'vpaid_video_flash_tester_el';
const createFlashTester = require('../../js/flashTester.js').createFlashTester;

describe('flashTester.js createFlashTester <-> FlashVPAID.swf', function() {
    let flashWrapper;

    beforeEach(function () {
        flashWrapper = document.createElement('div');
        document.body.appendChild(flashWrapper);
        delete window[FLASH_TEST];
    });

    afterEach(function () {
        document.body.removeChild(flashWrapper);
    });

    it('must be supported', function(done) {
        var flashTester = createFlashTester(flashWrapper);
        assert(!flashTester.isSupported());

        flashTester.on('change', function() {
            assert(flashTester.isSupported());
            done();
        });
    });

});
