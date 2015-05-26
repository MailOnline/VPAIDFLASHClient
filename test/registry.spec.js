let SingleValueRegistry = require('../js/registry.js').SingleValueRegistry;
let MultipleValuesRegistry = require('../js/registry.js').MultipleValuesRegistry;

describe('registry.js SingleValueRegistry', function()  {
    let registry;
    beforeEach(function() {
        registry = new SingleValueRegistry();
    });
    it('implements add', function () {
        var data1 = {}, data2 = {hello: 'hello'};
        var key = 'hello';
        registry.add(key, data1);
        assert.equal(registry._registries[key], data1);

        registry.add(key, data2);
        assert.equal(registry._registries[key], data2);
    });
    it('implements get', function () {
        var data1 = {}, data2 = {hello: 'hello'};
        var key = 'hello';
        registry.add(key, data1);
        assert.equal(registry.get(key), data1);

        registry.add(key, data2);
        assert.equal(registry.get(key), data2);
    });
    /*
    it('implements findByValue', function () {
    });
    it('implements remove', function () {
    });
    it('implements removeByKey', function () {
    });
    it('implements removeByValue', function () {
    });
    it('implements removeAll', function () {
    });
    it('implements size', function () {
    });
   */
});

describe('registry.js MultipleValuesRegistry', function()  {
    let registry;
    beforeEach(function() {
        registry = new MultipleValuesRegistry();
    });
    it('implements add', function () {
        var data1 = {}, data2 = {hello: 'hello'};
        var key = 'hello';
        registry.add(key, data1);
        assert.equal(registry._registries[key][0], data1);

        registry.add(key, data2);
        assert.equal(registry._registries[key][1], data2);
    });
    it('implements get', function () {
        var data1 = {}, data2 = {hello: 'hello'};
        var key = 'hello';
        registry.add(key, data1);
        assert.equal(registry.get(key)[0], data1);

        registry.add(key, data2);
        assert.equal(registry.get(key)[1], data2);
    });
    /*
    it('implements findByValue', function () {
    });
    it('implements remove', function () {
    });
    it('implements removeByKey', function () {
    });
    it('implements removeByValue', function () {
    });
    it('implements removeAll', function () {
    });
    it('implements size', function () {
    });
   */
});


