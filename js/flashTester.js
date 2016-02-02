'use strict';

const FLASH_TEST = 'vpaid_video_flash_tester';
const FLASH_TEST_EL = 'vpaid_video_flash_tester_el';
const JSFlashBridge = require('./jsFlashBridge').JSFlashBridge;
const createElementWithID = require('./utils').createElementWithID;
const MultipleValuesRegistry = require('./registry').MultipleValuesRegistry;

class FlashTester {
    constructor(parent, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}) {
        this.parentEl = createElementWithID(parent, FLASH_TEST_EL); // some browsers create global variables using the element id http://stackoverflow.com/questions/3434278/do-dom-tree-elements-with-ids-become-global-variables
        this.parentEl.style.display = 'none'; // hide test element, we need to test if the element being hidden will still work or not
        var params = {};
        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${FLASH_TEST_EL}&handler=${JSFlashBridge.VPAID_FLASH_HANDLER}`;

        this.el = swfobject.createSWF(swfConfig, params, FLASH_TEST_EL);
        this._handlers = new MultipleValuesRegistry();
        this._isSupported = false;
        if (this.el) {
            this._flash = new JSFlashBridge(this.el, swfConfig.data, FLASH_TEST_EL, 400, 400, ()=> {
                const support = true;
                this._isSupported = support;
                this._handlers.get('change').forEach((callback) => {
                    setTimeout(()=> {
                        callback('change', support);
                    }, 0);
                });
            });
        }
    }
    isSupported() {
        return this._isSupported;
    }
    on(eventName, callback) {
        this._handlers.add(eventName, callback);
    }
}

export var createFlashTester = function createFlashTester(el, swfConfig) {
    if (!window[FLASH_TEST]) {
        window[FLASH_TEST] = new FlashTester(el, swfConfig);
    }
    return window[FLASH_TEST];
};
