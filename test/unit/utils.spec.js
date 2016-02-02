let utils = require('../../js/utils.js');

describe('utils.js api', function()  {

    it('must implement noop', function () {
        assert.isFunction(utils.noop, 'must be a function');
        assert.isUndefined(utils.noop(), 'must return undefined');
    });

    it('must implement unique', function () {
        assert.isFunction(utils.unique, 'must be a function');
        assert.isFunction(utils.unique('hello'), 'must return a function');
        assert.match(utils.unique('hello')(), /hello_/, 'must return a string with prefix');
        assert.match(utils.unique('hello')(), /hello_/, 'must return a string with prefix');
    });

    it('must implement isPositiveInt', function() {
        assert.isFunction(utils.isPositiveInt, 'must be a function');
        assert.isNumber(utils.isPositiveInt('a', 0));
        assert.equal(utils.isPositiveInt(-1, 2), 2);
        assert.equal(utils.isPositiveInt(4, 8), 4);
    });

    describe('createElementWithID', function() {
        it('must be a function createElementWithID', function() {
            assert.isFunction(utils.createElementWithID, 'must be a function');
        });

        it('muste create a element with an ID', function() {
            assert.instanceOf(utils.createElementWithID(document.createElement('div'), 'hello'), HTMLElement, 'must return a HTMLElement');
            assert.equal(utils.createElementWithID(document.createElement('div'), 'hello').id, 'hello', 'must return a HTMLElement with the id used in the arguments');
            let parentElement = document.createElement('div');
            assert.equal(utils.createElementWithID(parentElement, 'hello').parentElement, parentElement, 'must return a HTMLElement that is a child of the element used in the arguments');
        });

        it('must delete the content of the parentElement', function() {
            let parentElement = document.createElement('div');
            utils.createElementWithID(parentElement, 'hello1');
            utils.createElementWithID(parentElement, 'hello2');
            assert.equal(parentElement.children.length, 2);
            utils.createElementWithID(parentElement, 'hello3', true);
            assert.equal(parentElement.children.length, 1);
        });
    });

    describe('callbackTimeout', function () {
        it('must be implemented', function() {
            assert.isFunction(utils.callbackTimeout, 'must be a function');
            assert.isFunction(utils.callbackTimeout(0, function () {}, function () {}), 'must return a function');
        });

        it('must timeout', function (done) {
            let success = sinon.spy();
            let timeout = sinon.spy();
            let callback = utils.callbackTimeout(0, success, timeout);

            setTimeout(function () {
                callback();
                assert(timeout.calledOnce, 'must call only once the timeout');
                assert(!success.called, 'mustn\'t call this function when timeout fired');
                done();
            }, 0);
        });

        it('mustn\'t timeout', function (done) {
            let success = sinon.spy();
            let timeout = sinon.spy();
            let callback = utils.callbackTimeout(0, success, timeout);
            callback();

            setTimeout(function () {
                assert(!timeout.called, 'mustn\'t call this function when the callback is called');
                assert(success.called, 'must call this function when callback is called');
                done();
            }, 0);
        });
    });

    describe('stringEndsWith', function () {
        describe('if browser doesn\'t implement endsWith', function () {
            let temp;
            beforeEach(function () {
                temp = String.prototype.endsWith;
                delete String.prototype.endsWith;
            });

            afterEach(function () {
                String.prototype.endsWith = temp;
            });

            it('must still work', function () {
                assert(utils.stringEndsWith('test_cool', 'cool'));
                assert(!utils.stringEndsWith('test_coolx_test', 'coolx'));
                assert(utils.stringEndsWith('test_coolx', 'coolx'));
            });
        });

        it('must be implemented', function () {
            assert(utils.stringEndsWith('test_cool', 'cool'));
            assert(!utils.stringEndsWith('test_coolx_test', 'coolx'));
            assert(utils.stringEndsWith('test_coolx', 'coolx'));
        });
    });

});

