'use strict';

const FLASH_TEST = 'vpaid_video_flash_tester';
const FLASH_TEST_EL = 'vpaid_video_flash_tester_el';
const createFlashTester = require('../../js/flashTester.js').createFlashTester;

describe('flashTester.js createFlashTester', function() {
    let flashWrapper;

    beforeEach(function() {
        flashWrapper = document.createElement('div');
        delete window[FLASH_TEST];
    });

    it('must be a function', function() {
        assert.isFunction(createFlashTester);
    });

    it('must create a global flash test to be shared between videoplayers', ()=> {
        const flashTester = createFlashTester(flashWrapper);
        assert.isDefined(window[FLASH_TEST]);
        assert.isDefined(flashTester);
    });

    describe('isSupported', function() {
        it('must be a function', function() {
            const flashTester = createFlashTester(flashWrapper);
            assert.isFunction(flashTester.isSupported);
        });
    });

    describe('on', function() {
        it('must be a function', function() {
            const flashTester = createFlashTester(flashWrapper);
            assert.isFunction(flashTester.on);
        });
    });
});
