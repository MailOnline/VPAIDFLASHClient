let JSFlashBridge = require('../../js/jsFlashBridge.js').JSFlashBridge;
let registry = require('../../js/jsFlashBridgeRegistry.js');
let addFlashMethodsToEl = require('../testHelper.js').addFlashMethodsToEl;
let noop = require('../testHelper.js').noop;
let after = require('../testHelper.js').after;

describe('jsFlashBridge.js api', function()  {
    let el, clock;
    const EL_ID = 'hello';

    beforeEach(function() {
        el = document.createElement('div');
        el.id = EL_ID;

        addFlashMethodsToEl(el, EL_ID);

        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        clock.restore();
    });

    it('must create in global a function in global scope', function () {
        assert.isFunction(window[JSFlashBridge.VPAID_FLASH_HANDLER]);
    });

    it('must add instance to registry', function () {
        var instance = new JSFlashBridge(el, '', EL_ID, 10, 10, noop);
        assert.equal(instance, registry.getInstanceByID(EL_ID));
    });

    [
        { key: 'getSize', value: {width: 15, height: 10} },
        { key: 'getWidth', value: 15 },
        { key: 'getHeight', value: 10  },
        { key: 'getFlashID', value: EL_ID },
        { key: 'getFlashURL', value: 'url' },
    ].forEach(function (getter) {
        it('must implement ' + getter.key, function () {
            var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
            assert.isFunction(instance[getter.key]);
            assert.deepEqual(instance[getter.key](), getter.value);
        });
    });

    it('must implement setWidth', function () {
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        assert.isFunction(instance.setWidth);

        assert.deepEqual(instance.getWidth(), 15);
        assert.deepEqual(instance.getSize(), {width: 15, height: 10});

        instance.setWidth(50);
        assert.deepEqual(instance.getWidth(), 50);
        assert.deepEqual(instance.getSize(), {width: 50, height: 10});
    });

    it('must implement setHeight', function () {
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        assert.isFunction(instance.setHeight);

        assert.deepEqual(instance.getHeight(), 10);
        assert.deepEqual(instance.getSize(), {width: 15, height: 10});

        instance.setHeight(30);
        assert.deepEqual(instance.getHeight(), 30);
        assert.deepEqual(instance.getSize(), {width: 15, height: 30});
    });

    it('must implement setSize', function () {
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        assert.isFunction(instance.setSize);

        assert.deepEqual(instance.getSize(), {width: 15, height: 10});
        assert.deepEqual(instance.getWidth(), 15);
        assert.deepEqual(instance.getHeight(), 10);

        instance.setSize(20, 30);
        assert.deepEqual(instance.getSize(), {width: 20, height: 30});
        assert.deepEqual(instance.getWidth(), 20);
        assert.deepEqual(instance.getHeight(), 30);
    });

    it('must implement callFlashMethod', function (done) {
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        var METHOD_NAME = 'getAdIcons';
        assert.isFunction(instance.setSize);

        var flashMethod = sinon.stub(el, METHOD_NAME);
        flashMethod.onSecondCall().throws();
        flashMethod.onThirdCall().throws();

        instance.callFlashMethod(METHOD_NAME, [], noop);
        assert(flashMethod.calledOnce, 'was called?');

        var callback1 = sinon.spy();
        var callback2 = sinon.spy(function () {
            assert(callback1.calledOnce);
            assert(callback2.calledOnce);
            done();
        });

        instance.callFlashMethod(METHOD_NAME, [], callback1);
        instance.on('AdError', callback2);
        instance.callFlashMethod(METHOD_NAME, []);

        clock.tick(100);
    });

    it('must register callback and call it', function (done) {
        var METHOD_NAME = 'getAdIcons';
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);

        sinon.stub(el, METHOD_NAME, function (argsData) {
            let callBackID = argsData[0];
            setTimeout(function () {
                window[JSFlashBridge.VPAID_FLASH_HANDLER](EL_ID, 'method', METHOD_NAME, callBackID, null, false);
            }, 0);
        });

        var callback = sinon.spy(function () {
            assert(callback.calledWith(null, false));
            done();
        });

        assert.equal(instance._callbacks.size(), 0);
        instance.callFlashMethod(METHOD_NAME, [], callback);
        assert.equal(instance._callbacks.size(), 1);

        clock.tick(100);
    });

    it('must implement _callCallback', function(done) {
        var METHOD_NAME = 'getAdIcons';
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        assert.isFunction(instance._callCallback);

        var callback = sinon.stub(instance, '_callCallback', function () {
            assert(callback.calledWith(METHOD_NAME));
            done();
        });

        instance.callFlashMethod(METHOD_NAME, [], noop);

        clock.tick(100);
    });

    [
        {method: 'on', handlerMethod: 'add', args: ['eventX', noop]},
        {method: 'off', handlerMethod: 'remove', args: ['eventX', noop]},
        {method: 'offEvent', handlerMethod: 'removeByKey', args: ['eventX']},
        {method: 'offAll', handlerMethod: 'removeAll', args: []}
    ].forEach(function (eventMethod) {

        it('must implement ' + eventMethod.method, function () {
            var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
            assert.isFunction(instance.off);


            var method = sinon.stub(instance._handlers, eventMethod.handlerMethod);
            instance[eventMethod.method].apply(instance, [eventMethod.handlerMethod].concat(eventMethod.args));
            assert(method.calledOnce);
            assert(method.args[0], eventMethod.args);
        });
    });


    it('must implement _trigger', function(done) {
        var EVENT_NAME = 'someEvent';
        var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        assert.isFunction(instance._trigger);

        var callback = sinon.stub(instance, '_trigger', function () {
            assert(callback.calledWith(EVENT_NAME, true));
            done();
        });

        window[JSFlashBridge.VPAID_FLASH_HANDLER](EL_ID, 'event', EVENT_NAME, '', null, true);

        clock.tick(100);
    });

    it('must implement triggered event should call all listeners', function(done) {
        let EVENT_NAME = 'someEvent';
        let instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
        let total = 10;
        let callbacks = [];

        let counter = after(total, function () {
            callbacks.forEach(function (callback) {
                assert(callback.calledOnce);
                assert(callback.calledWith(true));
            });
            done();
        });

        for (let i = 0; i < total; i++) {
            callbacks.push(sinon.spy(counter));
        }

        callbacks.forEach(function (callback) {
            instance.on(EVENT_NAME, callback);
        });

        window[JSFlashBridge.VPAID_FLASH_HANDLER](EL_ID, 'event', EVENT_NAME, '', null, true);
        clock.tick(100);
    });

    describe('destroy', function () {

        it('must destroy instance from registry', function () {
            var instance = new JSFlashBridge(el, '', EL_ID, 10, 10, noop);
            assert.equal(instance, registry.getInstanceByID(EL_ID));
            instance.destroy();
            assert.isUndefined(registry.getInstanceByID(EL_ID));
        });

        it('must avoid calling a callback if is destroyed', function() {
            const METHOD_NAME = '123';
            var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
            var callback = sinon.spy();

            instance._callbacks.add(METHOD_NAME, callback);

            window[JSFlashBridge.VPAID_FLASH_HANDLER](EL_ID, 'method', METHOD_NAME, '', null, true);
            instance.destroy();

            clock.tick(100);
            assert(!callback.called);
        });

        it('must avoid triggering the eventlisteners if is destroyed', function() {
            const EVENT_NAME = 'someEvent';
            var instance = new JSFlashBridge(el, 'url', EL_ID, 15, 10, noop);
            var callback = sinon.spy();

            instance.on(EVENT_NAME, callback);

            window[JSFlashBridge.VPAID_FLASH_HANDLER](EL_ID, 'event', EVENT_NAME, '', null, true);
            instance.destroy();

            clock.tick(100);
            assert(!callback.called);
        });
    });
});

