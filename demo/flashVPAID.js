(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x5,
    property = _x6,
    receiver = _x7; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var IVPAID = require('./IVPAID').IVPAID;
var noop = require('./utils').noop;
var unique = require('./utils').unique('vpaid');
var instances = {};
var VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

function createElementWithID(parent, id) {
    var nEl = document.createElement('div');
    nEl.id = id;
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

//TODO: check if the swf will be in the same domain, but I think will not be...

var FlashVPAID = (function (_IVPAID) {
    function FlashVPAID(vpaidWrapper, callback) {
        var swfConfig = arguments[2] === undefined ? { data: 'VPAIDFlash.swf', width: 800, height: 400 } : arguments[2];
        var version = arguments[3] === undefined ? '9' : arguments[3];
        var params = arguments[4] === undefined ? { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always' } : arguments[4];
        var debug = arguments[5] === undefined ? false : arguments[5];

        _classCallCheck(this, FlashVPAID);

        _get(Object.getPrototypeOf(FlashVPAID.prototype), 'constructor', this).call(this);
        this.vpaidWrapper = vpaidWrapper;
        this.flashID = unique();
        this.load = callback || noop;
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

},{"./IVPAID":2,"./utils":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//simple representation of the API

var IVPAID = (function () {
    function IVPAID() {
        _classCallCheck(this, IVPAID);
    }

    _createClass(IVPAID, [{
        key: "handshakeVersion",

        //async methods
        value: function handshakeVersion() {}
    }, {
        key: "initAd",
        value: function initAd() {}
    }, {
        key: "resizeAd",
        value: function resizeAd() {}
    }, {
        key: "startAd",
        value: function startAd() {}
    }, {
        key: "stopAd",
        value: function stopAd() {}
    }, {
        key: "pauseAd",
        value: function pauseAd() {}
    }, {
        key: "resumeAd",
        value: function resumeAd() {}
    }, {
        key: "expandAd",
        value: function expandAd() {}
    }, {
        key: "collapseAd",
        value: function collapseAd() {}
    }, {
        key: "skipAd",
        value: function skipAd() {}
    }, {
        key: "adLinear",

        //properties that will be treat as async methods
        value: function adLinear() {}
    }, {
        key: "adWidth",
        value: function adWidth() {}
    }, {
        key: "adHeight",
        value: function adHeight() {}
    }, {
        key: "adExpanded",
        value: function adExpanded() {}
    }, {
        key: "adSkippableState",
        value: function adSkippableState() {}
    }, {
        key: "adRemainingTime",
        value: function adRemainingTime() {}
    }, {
        key: "adDuration",
        value: function adDuration() {}
    }, {
        key: "adVolume",
        value: function adVolume() {}
    }, {
        key: "adCompanions",
        value: function adCompanions() {}
    }, {
        key: "adIcons",
        value: function adIcons() {}
    }]);

    return IVPAID;
})();

exports.IVPAID = IVPAID;

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