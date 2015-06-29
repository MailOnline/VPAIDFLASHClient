'use strict';

let SingleValueRegistry = require('./registry').SingleValueRegistry;
let instances = new SingleValueRegistry();

const JSFlashBridgeRegistry = {};
Object.defineProperty(JSFlashBridgeRegistry, 'addInstance', {
    writable: false,
    configurable: false,
    value: function (id, instance) {
        instances.add(id, instance);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'getInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.get(id);
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'removeInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances.remove(id);
    }
});

module.exports = JSFlashBridgeRegistry;

