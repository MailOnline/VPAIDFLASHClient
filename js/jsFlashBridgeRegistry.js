let instances = {};
const JSFlashBridgeRegistry = {};

Object.defineProperty(JSFlashBridgeRegistry, 'addInstance', {
    writable: false,
    configurable: false,
    value: function (instance, id) {
        instances[id] = instance;
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'getInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        return instances[id];
    }
});

Object.defineProperty(JSFlashBridgeRegistry, 'destroyInstanceByID', {
    writable: false,
    configurable: false,
    value: function (id) {
        delete instances[id];
    }
});

module.exports = JSFlashBridgeRegistry;

