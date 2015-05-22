(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//if this code already run once don't do anything
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FlashVPAID = (function () {
    if (window.FlashVPAID) return;

    var FlashWrapper = require('./flashWrapper').FlashWrapper;
    var Creative = require('./creative').Creative;

    var noop = require('./utils').noop;
    var isPositiveInt = require('./utils').isPositiveInt;
    var createElementWithID = require('./utils').createElementWithID;
    var uniqueVPAID = require('./utils').unique('vpaid');
    var instances = {};

    var ERROR = 'error';
    var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

    var FlashVPAID = (function () {
        function FlashVPAID(vpaidParentEl, callback) {
            var swfConfig = arguments[2] === undefined ? { data: 'VPAIDFlash.swf', width: 800, height: 400 } : arguments[2];
            var version = arguments[3] === undefined ? '9' : arguments[3];
            var params = arguments[4] === undefined ? { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always' } : arguments[4];
            var debug = arguments[5] === undefined ? true : arguments[5];

            _classCallCheck(this, FlashVPAID);

            if (!swfobject) throw new Error('no swfobject in global scope. check: https://github.com/swfobject/swfobject or https://code.google.com/p/swfobject/');

            this._vpaidParentEl = vpaidParentEl;
            this._flashID = uniqueVPAID();
            this._load = callback || noop;
            this._destroyed = false;

            //validate the height
            swfConfig.width = isPositiveInt(swfConfig.width, 800);
            swfConfig.height = isPositiveInt(swfConfig.height, 400);

            createElementWithID(vpaidParentEl, this._flashID);

            //because flash externalInterface will call
            instances[this._flashID] = this;

            params.movie = swfConfig.data;
            params.FlashVars = 'flashid=' + this._flashID + '&handler=' + VPAID_FLASH_HANDLER + '&debug=' + debug;

            if (swfobject.hasFlashPlayerVersion(version)) {
                this.el = swfobject.createSWF(swfConfig, params, this._flashID);
                this._flash = new FlashWrapper(this.el, swfConfig.data, this._flashID, swfConfig.width, swfConfig.height);
            }
        }

        _createClass(FlashVPAID, [{
            key: 'destroy',
            value: function destroy() {
                this._flash.offAll();
                this._flash.removeAllCallbacks();
                this._flash = null;
                this.vpaidParentEl.removeChild(this.el);
                this.el = null;
                this._creativeLoad = null;
                delete instances[this._flashID];
                this._destroyed = true;
            }
        }, {
            key: 'isDestroyed',
            value: function isDestroyed() {
                return this._destroyed;
            }
        }, {
            key: '_flash_handShake',
            value: function _flash_handShake(error, message) {
                this._load(error, message);
            }
        }, {
            key: 'loadAdUnit',
            value: function loadAdUnit(adURL, callback) {
                var _this = this;

                if (this._creative) {
                    throw new error('creative still exists');
                }

                this._creativeLoad = function (err, message) {
                    if (!err) {
                        _this._creative = new Creative(_this._flash);
                    }
                    _this._creativeLoad = null;
                    callback(err, _this._creative);
                };

                this._flash.callFlashMethod('loadAdUnit', [adURL], this._creativeLoad);
            }
        }, {
            key: 'unloadAdUnit',
            value: function unloadAdUnit() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                if (!this._creative) {
                    throw new Error('Can\'t unload a creative that doesn\'t exist');
                }

                this._creative = null;

                if (this._creativeLoad) {
                    this._flash.removeCallback(this._creativeLoad);
                    this._creativeLoad = null;
                }

                this._flash.callFlashMethod('unloadAdUnit', [], callback);
            }
        }, {
            key: 'getFlashID',
            value: function getFlashID() {
                return this._flash.getFlashID();
            }
        }, {
            key: 'getFlashURL',
            value: function getFlashURL() {
                return this._flash.getFlashURL();
            }
        }]);

        return FlashVPAID;
    })();

    Object.defineProperty(FlashVPAID, 'VPAID_FLASH_HANDLER', {
        writable: false,
        configurable: false,
        value: VPAID_FLASH_HANDLER
    });

    window[VPAID_FLASH_HANDLER] = function (flashID, type, event, callID, error, data) {
        if (event === 'handShake') {
            instances[flashID]._flash_handShake(error, data);
        } else {
            if (type !== 'event') {
                instances[flashID]._flash.callCallback(event, callID, error, data);
            } else {
                instances[flashID]._flash.trigger(event, error, data);
            }
        }
    };
    window.FlashVPAID = FlashVPAID;

    return FlashVPAID;
})();

module.exports = FlashVPAID;

},{"./creative":3,"./flashWrapper":4,"./utils":5}],2:[function(require,module,exports){
//simple representation of the API
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var IVPAID = (function () {
    function IVPAID() {
        _classCallCheck(this, IVPAID);
    }

    _createClass(IVPAID, [{
        key: 'handshakeVersion',

        //all methods below
        //are async methods
        value: function handshakeVersion() {
            var playerVPAIDVersion = arguments[0] === undefined ? '2.0' : arguments[0];
            var callback = arguments[1] === undefined ? undefined : arguments[1];
        }
    }, {
        key: 'initAd',

        //width and height is not in the beginning because we will use the default width/height used in the constructor
        value: function initAd(viewMode, desiredBitrate) {
            var width = arguments[2] === undefined ? 0 : arguments[2];
            var height = arguments[3] === undefined ? 0 : arguments[3];
            var creativeData = arguments[4] === undefined ? '' : arguments[4];
            var environmentVars = arguments[5] === undefined ? '' : arguments[5];
            var callback = arguments[6] === undefined ? undefined : arguments[6];
        }
    }, {
        key: 'resizeAd',
        value: function resizeAd(width, height, viewMode) {
            var callback = arguments[3] === undefined ? undefined : arguments[3];
        }
    }, {
        key: 'startAd',
        value: function startAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'stopAd',
        value: function stopAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'pauseAd',
        value: function pauseAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'resumeAd',
        value: function resumeAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'expandAd',
        value: function expandAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'collapseAd',
        value: function collapseAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'skipAd',
        value: function skipAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];
        }
    }, {
        key: 'adLinear',

        //properties that will be treat as async methods
        value: function adLinear(callback) {}
    }, {
        key: 'adWidth',
        value: function adWidth(callback) {}
    }, {
        key: 'adHeight',
        value: function adHeight(callback) {}
    }, {
        key: 'adExpanded',
        value: function adExpanded(callback) {}
    }, {
        key: 'adSkippableState',
        value: function adSkippableState(callback) {}
    }, {
        key: 'adRemainingTime',
        value: function adRemainingTime(callback) {}
    }, {
        key: 'adDuration',
        value: function adDuration(callback) {}
    }, {
        key: 'setAdVolume',
        value: function setAdVolume(soundVolume) {
            var callback = arguments[1] === undefined ? undefined : arguments[1];
        }
    }, {
        key: 'getAdVolume',
        value: function getAdVolume(callback) {}
    }, {
        key: 'adCompanions',
        value: function adCompanions(callback) {}
    }, {
        key: 'adIcons',
        value: function adIcons(callback) {}
    }]);

    return IVPAID;
})();

exports.IVPAID = IVPAID;

//ALL events that can be subscribed
var ALL_EVENTS = ['AdLoaded', 'AdStarted', 'AdStopped', 'AdSkipped', 'AdSkippableStateChange', 'AdSizeChange', 'AdLinearChange', 'AdDurationChange', 'AdExpandedChange', 'AdRemainingTimeChange', // [Deprecated in 2.0] but will be still fired for backwards compatibility
'AdVolumeChange', 'AdImpression', 'AdVideoStart', 'AdVideoFirstQuartile', 'AdVideoMidpoint', 'AdVideoThirdQuartile', 'AdVideoComplete', 'AdClickThru', 'AdInteraction', 'AdUserAcceptInvitation', 'AdUserMinimize', 'AdUserClose', 'AdPaused', 'AdPlaying', 'AdLog', 'AdError'];
exports.ALL_EVENTS = ALL_EVENTS;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x17, _x18, _x19) { var _again = true; _function: while (_again) { var object = _x17, property = _x18, receiver = _x19; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x17 = parent; _x18 = property; _x19 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var IVPAID = require('./VPAID').IVPAID;

var Creative = (function (_IVPAID) {
    function Creative(flash) {
        _classCallCheck(this, Creative);

        _get(Object.getPrototypeOf(Creative.prototype), 'constructor', this).call(this);
        this._flash = flash;
    }

    _inherits(Creative, _IVPAID);

    _createClass(Creative, [{
        key: 'on',
        value: function on(eventName, callback) {
            this._flash.on(eventName, callback);
        }
    }, {
        key: 'off',
        value: function off(eventName, callback) {
            this._flash.on(eventName, callback);
        }
    }, {
        key: 'handshakeVersion',

        //VPAID interface
        value: function handshakeVersion() {
            var playerVPAIDVersion = arguments[0] === undefined ? '2.0' : arguments[0];
            var callback = arguments[1] === undefined ? undefined : arguments[1];

            this._flash.callFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
        }
    }, {
        key: 'initAd',
        value: function initAd(viewMode, desiredBitrate) {
            var width = arguments[2] === undefined ? 0 : arguments[2];
            var height = arguments[3] === undefined ? 0 : arguments[3];
            var creativeData = arguments[4] === undefined ? '' : arguments[4];
            var environmentVars = arguments[5] === undefined ? '' : arguments[5];
            var callback = arguments[6] === undefined ? undefined : arguments[6];

            //resize element that has the flash object
            this._flash.setSize(width, height);

            this._flash.callFlashMethod('initAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars], callback);
        }
    }, {
        key: 'resizeAd',
        value: function resizeAd(width, height, viewMode) {
            var callback = arguments[3] === undefined ? undefined : arguments[3];

            //resize element that has the flash object
            this._flash.setSize(width, height);

            //resize ad inside the flash
            this._flash.callFlashMethod('resizeAd', [this._flash.getWidth(), this._flash.getHeight(), viewMode], callback);
        }
    }, {
        key: 'startAd',
        value: function startAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('startAd', [], callback);
        }
    }, {
        key: 'stopAd',
        value: function stopAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('stopAd', [], callback);
        }
    }, {
        key: 'pauseAd',
        value: function pauseAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('pauseAd', [], callback);
        }
    }, {
        key: 'resumeAd',
        value: function resumeAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('resumeAd', [], callback);
        }
    }, {
        key: 'expandAd',
        value: function expandAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('expandAd', [], callback);
        }
    }, {
        key: 'collapseAd',
        value: function collapseAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('collapseAd', [], callback);
        }
    }, {
        key: 'skipAd',
        value: function skipAd() {
            var callback = arguments[0] === undefined ? undefined : arguments[0];

            this._flash.callFlashMethod('skipAd', [], callback);
        }
    }, {
        key: 'adLinear',

        //properties that will be treat as async methods
        value: function adLinear(callback) {
            this._flash.callFlashMethod('adLinear', [], callback);
        }
    }, {
        key: 'adWidth',
        value: function adWidth(callback) {
            this._flash.callFlashMethod('adWidth', [], callback);
        }
    }, {
        key: 'adHeight',
        value: function adHeight(callback) {
            this._flash.callFlashMethod('adHeight', [], callback);
        }
    }, {
        key: 'adExpanded',
        value: function adExpanded(callback) {
            this._flash.callFlashMethod('adExpanded', [], callback);
        }
    }, {
        key: 'adSkippableState',
        value: function adSkippableState(callback) {
            this._flash.callFlashMethod('adSkippableState', [], callback);
        }
    }, {
        key: 'adRemainingTime',
        value: function adRemainingTime(callback) {
            this._flash.callFlashMethod('adRemainingTime', [], callback);
        }
    }, {
        key: 'adDuration',
        value: function adDuration(callback) {
            this._flash.callFlashMethod('adDuration', [], callback);
        }
    }, {
        key: 'setAdVolume',
        value: function setAdVolume(volume) {
            var callback = arguments[1] === undefined ? undefined : arguments[1];

            this._flash.callFlashMethod('setAdVolume', [volume], callback);
        }
    }, {
        key: 'getAdVolume',
        value: function getAdVolume(callback) {
            this._flash.callFlashMethod('getAdVolume', [], callback);
        }
    }, {
        key: 'adCompanions',
        value: function adCompanions(callback) {
            this._flash.callFlashMethod('adCompanions', [], callback);
        }
    }, {
        key: 'adIcons',
        value: function adIcons(callback) {
            this._flash.callFlashMethod('adIcons', [], callback);
        }
    }]);

    return Creative;
})(IVPAID);

exports.Creative = Creative;

},{"./VPAID":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var unique = require('./utils').unique;
var isPositiveInt = require('./utils').isPositiveInt;
var ERROR = 'error';

var FlashWrapper = (function () {
    function FlashWrapper(el, flashURL, flashID, width, height) {
        _classCallCheck(this, FlashWrapper);

        this._el = el;
        this._flashID = flashID;
        this._flashURL = flashURL;
        this._width = width;
        this._height = height;
        this._handlers = {};
        this._callbacks = {};
        this._uniqueMethodIdentifier = unique(this._flashID);
    }

    _createClass(FlashWrapper, [{
        key: 'on',
        value: function on(eventName, callback) {
            if (!this._handlers[eventName]) {
                this._handlers[eventName] = [];
            }
            this._handlers[eventName].push(callback);
        }
    }, {
        key: 'off',
        value: function off(eventName, callback) {
            if (!this._handlers[eventName]) {
                return;
            }

            var index = this._handlers[eventName].indexOf(callback);

            if (index < 0) {
                return;
            }
            return this._handlers[eventName].splice(index, 1);
        }
    }, {
        key: 'offEvent',
        value: function offEvent(eventName) {
            if (!this._handlers[eventName]) {
                return;
            }

            return this._handlers[eventName].splice(0, this._handlers[eventName].length);
        }
    }, {
        key: 'offAll',
        value: function offAll() {
            var old = this._handlers;
            this._handlers = {};
            return old;
        }
    }, {
        key: 'callFlashMethod',
        value: function callFlashMethod(methodName) {
            var args = arguments[1] === undefined ? [] : arguments[1];
            var callback = arguments[2] === undefined ? undefined : arguments[2];

            var callbackID = '';
            // if no callback, some methods the return is void so they don't need callback
            if (callback) {
                var callbackID = this._uniqueMethodIdentifier();
                this._callbacks[callbackID] = callback;
            }

            try {
                //methods are created by ExternalInterface.addCallback in as3 code, if for some reason it failed
                //this code will throw an error
                this._el[methodName]([callbackID].concat(args));
            } catch (e) {
                if (callback) {
                    delete this._callbacks[callbackID];
                    callback(e);
                } else {

                    //if there isn't any callback to return error use error event handler
                    this._trigger(ERROR, [e]);
                }
            }
        }
    }, {
        key: 'removeCallback',
        value: function removeCallback(methodName, callback) {
            //TODO: check if keys and find is added to the browser with babeljs
            var key = Object.keys(this._callbacks).find(function (key) {
                return this._callbacks[key] === callback;
            });

            if (!key) {
                return;
            }

            delete this._callbacks[key];
            return callback;
        }
    }, {
        key: 'removeAllCallback',
        value: function removeAllCallback() {
            var old = this._callbacks;
            this._callbacks = {};
            return old;
        }
    }, {
        key: 'trigger',
        value: function trigger(eventName, err, result) {
            //TODO: check if forEach and isArray is added to the browser with babeljs
            if (Array.isArray(this._handlers[eventName])) {
                this._handlers[eventName].forEach(function (callback) {
                    setTimeout(function () {
                        callback(err, result);
                    }, 0);
                });
            }
        }
    }, {
        key: 'callCallback',
        value: function callCallback(methodName, callbackID, err, result) {

            //not all methods callback's are mandatory
            if (callbackID === '' || !this._callbacks[callbackID]) {
                //but if there exist an error, fire the error event
                if (err) this.trigger(ERROR, err, result);
                return;
            }

            var callback = this._callbacks[callbackID];
            setTimeout(function () {
                callback(err, result);
            }, 0);

            delete this._callbacks[callbackID];
        }
    }, {
        key: 'getSize',

        //methods like properties specific to this implementation of VPAID
        value: function getSize() {
            return { width: this._width, height: this._height };
        }
    }, {
        key: 'setSize',
        value: function setSize(newWidth, newHeight) {
            this._width = isPositiveInt(newWidth, this._width);
            this._height = isPositiveInt(newHeight, this._height);
            this._el.setAttribute('width', this._width);
            this._el.setAttribute('height', this._height);
        }
    }, {
        key: 'getWidth',
        value: function getWidth() {
            return this._width;
        }
    }, {
        key: 'setWidth',
        value: function setWidth(newWidth) {
            this.setSize(newWidth, this._height);
        }
    }, {
        key: 'getHeight',
        value: function getHeight() {
            return this._height;
        }
    }, {
        key: 'setHeight',
        value: function setHeight(newHeight) {
            this.setSize(this._width, newHeight);
        }
    }, {
        key: 'getFlashID',
        value: function getFlashID() {
            return this._flashID;
        }
    }, {
        key: 'getFlashURL',
        value: function getFlashURL() {
            return this._flashURL;
        }
    }]);

    return FlashWrapper;
})();

exports.FlashWrapper = FlashWrapper;

},{"./utils":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.unique = unique;
exports.noop = noop;
exports.createElementWithID = createElementWithID;
exports.isPositiveInt = isPositiveInt;

function unique(prefix) {
    var count = -1;
    return function (f) {
        return '' + prefix + '_' + ++count;
    };
}

function noop() {}

function createElementWithID(parent, id) {
    var nEl = document.createElement('div');
    nEl.id = id;
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

function isPositiveInt(newVal, oldVal) {
    return Number.isSafeInteger(newVal) && newVal > 0 ? newVal : oldVal;
}

},{}]},{},[1])


//# sourceMappingURL=flashVPAID.js.map