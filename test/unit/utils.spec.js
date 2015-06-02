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

    it('must implement createElementWithID', function() {
        assert.isFunction(utils.createElementWithID, 'must be a function');
        assert.instanceOf(utils.createElementWithID(document.createElement('div'), 'hello'), HTMLElement, 'must return a HTMLElement');
        assert.equal(utils.createElementWithID(document.createElement('div'), 'hello').id, 'hello', 'must return a HTMLElement with the id used in the arguments');
        let parentElement = document.createElement('div');
        assert.equal(utils.createElementWithID(parentElement, 'hello').parentElement, parentElement, 'must return a HTMLElement that is a child of the element used in the arguments');
    });
});

