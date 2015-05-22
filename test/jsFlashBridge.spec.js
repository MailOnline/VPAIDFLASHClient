let JSFlashBridge = require('../js/jsFlashBridge.js').JSFlashBridge;
let registry = require('../js/jsFlashBridgeRegistry.js');
let addFlashMethodsToEl = require('./testHelper.js').addFlashMethodsToEl;
let noop = require('./testHelper.js').noop;

describe('jsFlashBridge.js api', function()  {
    let el;

    const EL_ID = 'hello';
    beforeEach(function() {
        el = document.createElement('div');
        el.id = EL_ID;

        addFlashMethodsToEl(el, EL_ID);
    });

    it('must create in global a function in global scope', function () {
        assert.isFunction(window[JSFlashBridge.VPAID_FLASH_HANDLER]);
    });

    it('must add instance to registry', function () {
        var instance = new JSFlashBridge(el, '', 'hello', 10, 10, noop);
        assert.equal(instance, registry.getInstanceByID('hello'));
    });

    it('must destroy instance from registry', function () {
        var instance = new JSFlashBridge(el, '', 'hello', 10, 10, noop);
        assert.equal(instance, registry.getInstanceByID('hello'));
        instance.destroy();
        assert.isUndefined(registry.getInstanceByID('hello'));
    });

    [
        { key: 'getSize', value: {width: 15, height: 10} },
        { key: 'getWidth', value: 15 },
        { key: 'getHeight', value: 10  },
        { key: 'getFlashID', value: 'hello' },
        { key: 'getFlashURL', value: 'url' },
    ].forEach(function (getter) {
        it('must implement ' + getter.key, function () {
            var instance = new JSFlashBridge(el, 'url', 'hello', 15, 10, noop);
            assert.isFunction(instance[getter.key]);
            assert.deepEqual(instance[getter.key](), getter.value);
        });
    });

    it('must implement setWidth', function () {
        var instance = new JSFlashBridge(el, 'url', 'hello', 15, 10, noop);
        assert.isFunction(instance.setWidth);

        assert.deepEqual(instance.getWidth(), 15);
        assert.deepEqual(instance.getSize(), {width: 15, height: 10});

        instance.setWidth(50);
        assert.deepEqual(instance.getWidth(), 50);
        assert.deepEqual(instance.getSize(), {width: 50, height: 10});
    });

    it('must implement setHeight', function () {
        var instance = new JSFlashBridge(el, 'url', 'hello', 15, 10, noop);
        assert.isFunction(instance.setHeight);

        assert.deepEqual(instance.getHeight(), 10);
        assert.deepEqual(instance.getSize(), {width: 15, height: 10});

        instance.setHeight(30);
        assert.deepEqual(instance.getHeight(), 30);
        assert.deepEqual(instance.getSize(), {width: 15, height: 30});
    });

    it('must implement setSize', function () {
        var instance = new JSFlashBridge(el, 'url', 'hello', 15, 10, noop);
        assert.isFunction(instance.setSize);

        assert.deepEqual(instance.getSize(), {width: 15, height: 10});
        assert.deepEqual(instance.getWidth(), 15);
        assert.deepEqual(instance.getHeight(), 10);

        instance.setSize(20, 30);
        assert.deepEqual(instance.getSize(), {width: 20, height: 30});
        assert.deepEqual(instance.getWidth(), 20);
        assert.deepEqual(instance.getHeight(), 30);
    });

});

