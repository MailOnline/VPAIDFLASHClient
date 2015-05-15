(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x12, _x13, _x14) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x12,
    property = _x13,
    receiver = _x14; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x12 = parent; _x13 = property; _x14 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

//if this code already run once don't do anything
(function () {
    if (window.FlashVPAID) return;

    var IVPAID = require('./IVPAID').IVPAID;
    var noop = require('./utils').noop;
    var unique = require('./utils').unique;
    var uniqueVPAID = unique('vpaid');
    var instances = {};
    var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

    function createElementWithID(parent, id) {
        var nEl = document.createElement('div');
        nEl.id = id;
        parent.innerHTML = '';
        parent.appendChild(nEl);
        return nEl;
    }

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

            this.vpaidWrapper = vpaidWrapper;
            this.flashID = uniqueVPAID();
            this.load = callback || noop;
            this._uniqueMethodIdentifier = unique(flashID);
            createElementWithID(vpaidWrapper, this.flashID);

            //because flash externalInterface will call
            instances[this.flashID] = this;

            params.movie = swfConfig.data;
            params.FlashVars = 'flashid=' + this.flashID + '&handler=' + VPAID_FLASH_HANDLER + '&debug=' + debug;

            if (swfobject.hasFlashPlayerVersion(version)) {
                this.el = swfobject.createSWF(swfConfig, params, this.flashID);
            }

            //if this.el is undefined means swfobject failed to create the swfobject
            if (!this.el) return this;
        }

        _inherits(FlashVPAID, _IVPAID);

        _createClass(FlashVPAID, [{
            key: '_safeFlashMethod',
            value: function _safeFlashMethod(methodName) {
                var args = arguments[1] === undefined ? [] : arguments[1];
                var callbacks = arguments[2] === undefined ? undefined : arguments[2];

                var callbackID = '';
                // if no callback, some methods the return is void so they don't need callback
                if (callback) {
                    var callbackID = this.uniqueMethodIdentifier();
                    this._callbacks[callbackID] = callback;
                }

                try {
                    this.el[methodName].call(this, [this.flashID, methodName, callbackID].concat(args));
                } catch (e) {
                    if (callback) {
                        delete this.callback[callbackID];
                        callback(e);
                    } else {

                        //if there isn't any callback to return error use error event handler
                        _fireEvent('error', [e]);
                    }
                }
            }
        }, {
            key: '_flashMethodAnswer',
            value: function _flashMethodAnswer(methodName, callbackID, args) {

                //method's that return void will not have callbacks
                if (callbackID === '') return;

                if (!this._callbacks[callbackID]) {
                    //TODO: something is wrong, this should never happens if it happens fire an error
                    return;
                }

                //TODO: check with carlos if we need to use apply instead
                this._callbacks[callbackID](args);
                delete this._callbacks[callbackID];
            }
        }, {
            key: '_fireEvent',
            value: function _fireEvent(eventName, args) {
                //TODO: check if forEach and isArray is added to the browser with babeljs
                if (Array.isArray(this._handlers[eventName])) {
                    this._handlers[eventName].forEach(function (callback) {
                        setTimeout(function () {
                            callback(args);
                        }, 0);
                    });
                }
            }
        }, {
            key: 'on',
            value: function on(eventName, callback) {
                if (!this._handlers[eventName]) {
                    this._handlers[eventName] = [];
                }
                this._handlers[eventName].push(callback);
            }
        }, {
            key: 'handshakeVersion',

            //async methods
            value: function handshakeVersion(callback) {
                var playerVPAIDVersion = arguments[1] === undefined ? '2.0' : arguments[1];

                _safeFlashMethod('handshakeVersion', [playerVPAIDVersion], callback);
            }
        }, {
            key: 'initAd',
            value: function initAd(viewMode, desiredBitrate) {
                var width = arguments[2] === undefined ? 0 : arguments[2];
                var height = arguments[3] === undefined ? 0 : arguments[3];
                var creativeData = arguments[4] === undefined ? '' : arguments[4];
                var environmentVars = arguments[5] === undefined ? '' : arguments[5];

                this.size(width, height);
                _safeFlashMethod('initAd', [this.getWidth(), this.getHeight(), viewMode, desiredBitrate, creativeData, environmentVars]);
            }
        }, {
            key: 'resizeAd',
            value: function resizeAd(width, height, viewMode) {
                this.size(width, height);
                _safeFlashMethod('resizeAd', [this.getWidth(), this.getHeight(), viewMode]);
            }
        }, {
            key: 'startAd',
            value: function startAd() {
                _safeFlashMethod('startAd');
            }
        }, {
            key: 'stopAd',
            value: function stopAd() {
                _safeFlashMethod('stopAd');
            }
        }, {
            key: 'pauseAd',
            value: function pauseAd() {
                _safeFlashMethod('pauseAd');
            }
        }, {
            key: 'resumeAd',
            value: function resumeAd() {
                _safeFlashMethod('resumeAd');
            }
        }, {
            key: 'expandAd',
            value: function expandAd() {
                _safeFlashMethod('expandAd');
            }
        }, {
            key: 'collapseAd',
            value: function collapseAd() {
                _safeFlashMethod('collapseAd');
            }
        }, {
            key: 'skipAd',
            value: function skipAd() {
                _safeFlashMethod('skipAd');
            }
        }, {
            key: 'adLinear',

            //properties that will be treat as async methods
            value: function adLinear(callback) {
                _safeFlashMethod('adLinear', [], callback);
            }
        }, {
            key: 'adWidth',
            value: function adWidth(callback) {
                _safeFlashMethod('adWidth', [], callback);
            }
        }, {
            key: 'adHeight',
            value: function adHeight(callback) {
                _safeFlashMethod('adHeight', [], callback);
            }
        }, {
            key: 'adExpanded',
            value: function adExpanded(callback) {
                _safeFlashMethod('adExpanded', [], callback);
            }
        }, {
            key: 'adSkippableState',
            value: function adSkippableState(callback) {
                _safeFlashMethod('adSkippableState', [], callback);
            }
        }, {
            key: 'adRemainingTime',
            value: function adRemainingTime(callback) {
                _safeFlashMethod('adRemainingTime', [], callback);
            }
        }, {
            key: 'adDuration',
            value: function adDuration(callback) {
                _safeFlashMethod('adDuration', [], callback);
            }
        }, {
            key: 'setAdVolume',

            //TODO: in flash we need to convert setAdVolume to a setter
            value: function setAdVolume(volume) {
                _safeFlashMethod('setAdVolume', [volume]);
            }
        }, {
            key: 'getAdVolume',

            //TODO: in flash we need to convert getAdVolume to a getter
            value: function getAdVolume(callback) {
                _safeFlashMethod('getAdVolume', [], callback);
            }
        }, {
            key: 'adCompanions',
            value: function adCompanions(callback) {
                _safeFlashMethod('adCompanions', [], callback);
            }
        }, {
            key: 'adIcons',
            value: function adIcons(callback) {
                _safeFlashMethod('adIcons', [], callback);
            }
        }, {
            key: '_flash_handShake',
            value: function _flash_handShake(message) {
                console.log('handShake:', message);
                if (message == 'prepared') {
                    this.load();
                }
            }
        }]);

        return FlashVPAID;
    })(IVPAID);

    window[VPAID_FLASH_HANDLER] = function (flashID, event, message) {
        console.log('flashID', flashID, 'event', event, 'message', message);
        //console.log(instances[flashID], instances[flashID]['_flash_']);
        instances[flashID]['_flash_' + event](message);
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
        key: 'getWidth',

        //custom implementation, sync methods
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
        key: 'getSize',
        value: function getSize() {}
    }, {
        key: 'setSize',
        value: function setSize(width, height) {}
    }, {
        key: 'handshakeVersion',

        //all methods below
        //are async methods
        value: function handshakeVersion(callback) {
            var playerVPAIDVersion = arguments[1] === undefined ? '2.0' : arguments[1];
        }
    }, {
        key: 'initAd',

        //width and height is not in the beginning because we will use the default width/height used in the constructor
        value: function initAd(viewMode, desiredBitrate) {
            var width = arguments[2] === undefined ? 0 : arguments[2];
            var height = arguments[3] === undefined ? 0 : arguments[3];
            var creativeData = arguments[4] === undefined ? '' : arguments[4];
            var environmentVars = arguments[5] === undefined ? '' : arguments[5];
        }
    }, {
        key: 'resizeAd',
        value: function resizeAd(width, height, viewMode) {}
    }, {
        key: 'startAd',
        value: function startAd() {}
    }, {
        key: 'stopAd',
        value: function stopAd() {}
    }, {
        key: 'pauseAd',
        value: function pauseAd() {}
    }, {
        key: 'resumeAd',
        value: function resumeAd() {}
    }, {
        key: 'expandAd',
        value: function expandAd() {}
    }, {
        key: 'collapseAd',
        value: function collapseAd() {}
    }, {
        key: 'skipAd',
        value: function skipAd() {}
    }, {
        key: 'adLinear',

        //properties that will be treat as async methods
        value: function adLinear() {}
    }, {
        key: 'adWidth',
        value: function adWidth() {}
    }, {
        key: 'adHeight',
        value: function adHeight() {}
    }, {
        key: 'adExpanded',
        value: function adExpanded() {}
    }, {
        key: 'adSkippableState',
        value: function adSkippableState() {}
    }, {
        key: 'adRemainingTime',
        value: function adRemainingTime() {}
    }, {
        key: 'adDuration',
        value: function adDuration() {}
    }, {
        key: 'setAdVolume',
        value: function setAdVolume(soundVolume) {}
    }, {
        key: 'getAdVolume',
        value: function getAdVolume() {}
    }, {
        key: 'adCompanions',
        value: function adCompanions() {}
    }, {
        key: 'adIcons',
        value: function adIcons() {}
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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unique = unique;
exports.noop = noop;

function unique(prefix) {
    var count = -1;
    return function (f) {
        return "" + prefix + "_" + ++count;
    };
}

function noop() {}

},{}]},{},[1])


//# sourceMappingURL=flashVPAID.js.map