(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x23, _x24, _x25) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x23,
    property = _x24,
    receiver = _x25; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x23 = parent; _x24 = property; _x25 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

//if this code already run once don't do anything
(function () {
    if (window.FlashVPAID) return;

    var IVPAID = require('./IVPAID').IVPAID;
    var noop = require('./utils').noop;
    var unique = require('./utils').unique;
    var isPositiveInt = require('./utils').isPositiveInt;
    var createElementWithID = require('./utils').createElementWithID;
    var uniqueVPAID = unique('vpaid');
    var instances = {};
    var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

    var FlashVPAID = (function (_IVPAID) {
        function FlashVPAID(vpaidWrapper, callback) {
            var swfConfig = arguments[2] === undefined ? { data: 'VPAIDFlash.swf', width: 800, height: 400 } : arguments[2];
            var version = arguments[3] === undefined ? '9' : arguments[3];
            var params = arguments[4] === undefined ? { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always' } : arguments[4];
            var debug = arguments[5] === undefined ? false : arguments[5];

            _classCallCheck(this, FlashVPAID);

            _get(Object.getPrototypeOf(FlashVPAID.prototype), 'constructor', this).call(this);

            this._handlers = {};
            this._callbacks = {};
            this._vpaidWrapper = vpaidWrapper;
            this._flashID = uniqueVPAID();
            this._load = callback || noop;

            //validate the height
            swfConfig.width = isPositiveInt(swfConfig.width, 800);
            swfConfig.height = isPositiveInt(swfConfig.height, 400);

            //cache sizes
            this._width = swfConfig.width;
            this._height = swfConfig.height;

            this._uniqueMethodIdentifier = unique(this._flashID);
            createElementWithID(vpaidWrapper, this._flashID);

            //because flash externalInterface will call
            instances[this._flashID] = this;

            params.movie = swfConfig.data;
            params.FlashVars = 'flashid=' + this._flashID + '&handler=' + VPAID_FLASH_HANDLER + '&debug=' + debug;

            if (swfobject.hasFlashPlayerVersion(version)) {
                this.el = swfobject.createSWF(swfConfig, params, this._flashID);
            }

            //if this.el is undefined means swfobject failed to create the swfobject
            if (!this.el) return this;
        }

        _inherits(FlashVPAID, _IVPAID);

        _createClass(FlashVPAID, [{
            key: '_safeFlashMethod',

            //internal methods don't call outside of FlashVPAID
            value: function _safeFlashMethod(methodName) {
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
                    this.el[methodName]([callbackID].concat(args));
                } catch (e) {
                    if (callback) {
                        delete this.callback[callbackID];
                        callback(e);
                    } else {

                        //if there isn't any callback to return error use error event handler
                        this._fireEvent('error', [e]);
                    }
                    console.log(e);
                }
            }
        }, {
            key: '_fireEvent',
            value: function _fireEvent(eventName, err, result) {
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
            key: '_flash_handShake',
            value: function _flash_handShake(error, message) {
                this._load(error, message);
            }
        }, {
            key: '_flash_methodAnswer',
            value: function _flash_methodAnswer(methodName, callbackID, err, result) {

                //method's that return void will not have callbacks
                if (callbackID === '') return;

                if (!this._callbacks[callbackID]) {
                    //TODO: something is wrong, this should never happens if it happens fire an error
                    return;
                }

                this._callbacks[callbackID](err, result);
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
            key: 'on',

            //methods specific to this implementation of VPAID
            value: function on(eventName, callback) {
                if (!this._handlers[eventName]) {
                    this._handlers[eventName] = [];
                }
                this._handlers[eventName].push(callback);
            }
        }, {
            key: 'loadAdUnit',
            value: function loadAdUnit(adURL, callback) {
                this._safeFlashMethod('loadAdUnit', [adURL], callback);
            }
        }, {
            key: 'unloadAdUnit',
            value: function unloadAdUnit(callback) {
                this._safeFlashMethod('unloadAdUnit', [], callback);
            }
        }, {
            key: 'handshakeVersion',

            //VPAID methods and properties of VPAID spec
            //async methods
            value: function handshakeVersion() {
                var playerVPAIDVersion = arguments[0] === undefined ? '2.0' : arguments[0];
                var callback = arguments[1] === undefined ? undefined : arguments[1];

                this._safeFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
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
                this.size(width, height);

                this._safeFlashMethod('initAd', [this.getWidth(), this.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars], callback);
            }
        }, {
            key: 'resizeAd',
            value: function resizeAd(width, height, viewMode) {
                var callback = arguments[3] === undefined ? undefined : arguments[3];

                //resize element that has the flash object
                this.size(width, height);

                //resize ad inside the flash
                this._safeFlashMethod('resizeAd', [this.getWidth(), this.getHeight(), viewMode], callback);
            }
        }, {
            key: 'startAd',
            value: function startAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('startAd', [], callback);
            }
        }, {
            key: 'stopAd',
            value: function stopAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('stopAd', [], callback);
            }
        }, {
            key: 'pauseAd',
            value: function pauseAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('pauseAd', [], callback);
            }
        }, {
            key: 'resumeAd',
            value: function resumeAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('resumeAd', [], callback);
            }
        }, {
            key: 'expandAd',
            value: function expandAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('expandAd', [], callback);
            }
        }, {
            key: 'collapseAd',
            value: function collapseAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('collapseAd', [], callback);
            }
        }, {
            key: 'skipAd',
            value: function skipAd() {
                var callback = arguments[0] === undefined ? undefined : arguments[0];

                this._safeFlashMethod('skipAd', [], callback);
            }
        }, {
            key: 'adLinear',

            //properties that will be treat as async methods
            value: function adLinear(callback) {
                this._safeFlashMethod('adLinear', [], callback);
            }
        }, {
            key: 'adWidth',
            value: function adWidth(callback) {
                this._safeFlashMethod('adWidth', [], callback);
            }
        }, {
            key: 'adHeight',
            value: function adHeight(callback) {
                this._safeFlashMethod('adHeight', [], callback);
            }
        }, {
            key: 'adExpanded',
            value: function adExpanded(callback) {
                this._safeFlashMethod('adExpanded', [], callback);
            }
        }, {
            key: 'adSkippableState',
            value: function adSkippableState(callback) {
                this._safeFlashMethod('adSkippableState', [], callback);
            }
        }, {
            key: 'adRemainingTime',
            value: function adRemainingTime(callback) {
                this._safeFlashMethod('adRemainingTime', [], callback);
            }
        }, {
            key: 'adDuration',
            value: function adDuration(callback) {
                this._safeFlashMethod('adDuration', [], callback);
            }
        }, {
            key: 'setAdVolume',
            value: function setAdVolume(volume) {
                var callback = arguments[1] === undefined ? undefined : arguments[1];

                this._safeFlashMethod('setAdVolume', [volume], callback);
            }
        }, {
            key: 'getAdVolume',
            value: function getAdVolume(callback) {
                this._safeFlashMethod('getAdVolume', [], callback);
            }
        }, {
            key: 'adCompanions',
            value: function adCompanions(callback) {
                this._safeFlashMethod('adCompanions', [], callback);
            }
        }, {
            key: 'adIcons',
            value: function adIcons(callback) {
                this._safeFlashMethod('adIcons', [], callback);
            }
        }]);

        return FlashVPAID;
    })(IVPAID);

    window[VPAID_FLASH_HANDLER] = function (flashID, type, event, callID, error, data) {
        console.log('flashID:', flashID, 'action:', event, 'data:', data);
        if (event === 'handShake') {
            instances[flashID]._flash_handShake(error, data);
        } else {
            if (type !== 'event') {
                instances[flashID]._flash_methodAnswer(event, callID, error, data);
            } else {
                instances[flashID]._fireEvent(event, error, data);
            }
        }
    };
    window.FlashVPAID = FlashVPAID;
})();

},{"./IVPAID":2,"./utils":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

//simple representation of the API

var IVPAID = (function () {
    function IVPAID() {
        _classCallCheck(this, IVPAID);
    }

    _createClass(IVPAID, [{
        key: 'getSize',

        //custom implementation, sync methods
        value: function getSize() {}
    }, {
        key: 'setSize',
        value: function setSize(width, height) {}
    }, {
        key: 'getWidth',
        value: function getWidth() {}
    }, {
        key: 'setWidth',
        value: function setWidth(w) {}
    }, {
        key: 'getHeight',
        value: function getHeight() {}
    }, {
        key: 'setHeight',
        value: function setHeight(h) {}
    }, {
        key: 'getFlashID',
        value: function getFlashID() {}
    }, {
        key: 'on',
        value: function on(eventName, callback) {}
    }, {
        key: 'loadAdUnit',
        value: function loadAdUnit(adURL, callback) {}
    }, {
        key: 'unloadAdUnit',
        value: function unloadAdUnit(callback) {}
    }, {
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

/*
Events that can be subscribed
AdLoaded
AdStarted
AdStopped
AdSkipped
AdSkippableStateChange
AdSizeChange
AdLinearChange
AdDurationChange
AdExpandedChange
AdRemainingTimeChange [Deprecated in 2.0] but will be still fired for backwards compatibility
AdVolumeChange
AdImpression
AdVideoStart, AdVideoFirstQuartile, AdVideoMidpoint, AdVideoThirdQuartile,
AdVideoComplete
AdClickThru
AdInteraction
AdUserAcceptInvitation, AdUserMinimize, AdUserClose
AdPaused, AdPlaying
AdLog
AdError
*/

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.unique = unique;
exports.noop = noop;
exports.createElementWithID = createElementWithID;
exports.isPositiveInt = isPositiveInt;
'use strict';

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