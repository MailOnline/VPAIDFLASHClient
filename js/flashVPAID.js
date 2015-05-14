let IVPAID = require('./IVPAID').IVPAID;
let noop = require('./utils').noop;
let unique = require('./utils').unique('vpaid');
let instances = {};
const VPAID_FLASH_HANDLER = 'vpaid_video_flash_handler';

function createElementWithID(parent, id) {
    var nEl = document.createElement('div');
    nEl.id = id;
    parent.innerHTML = '';
    parent.appendChild(nEl);
    return nEl;
}

//TODO: check if the swf will be in the same domain, but I think will not be...
class FlashVPAID extends IVPAID {
    constructor (vpaidWrapper, callback, swfConfig = {data: 'VPAIDFlash.swf', width: 800, height: 400}, version = '9', params = { wmode: 'transparent', salign: 'tl', allowScriptAccess: 'always'}, debug = false) {
        super();
        this.vpaidWrapper = vpaidWrapper;
        this.flashID = unique();
        this.load =  callback || noop;
        createElementWithID(vpaidWrapper, this.flashID);

        //because flash externalInterface will call
        instances[this.flashID] = this;

        params.movie = swfConfig.data;
        params.FlashVars = `flashid=${this.flashID}&handler=${VPAID_FLASH_HANDLER}&debug=${debug}`;

        if (swfobject.hasFlashPlayerVersion(version)) {
            this.el = swfobject.createSWF(swfConfig, params, this.flashID);
        }

        //if this.el is undefined means swfobject failed to create the swfobject
        if (!this.el) return this;
    }
    _flash_handShake (message) {
        console.log('handShake:', message);
        if (message == 'prepared') {
            this.load();
        }
    }
}


window[VPAID_FLASH_HANDLER] = function (flashID, event, message) {
    console.log('flashID', flashID, 'event', event, 'message', message);
    //console.log(instances[flashID], instances[flashID]['_flash_']);
    instances[flashID]['_flash_' + event](message);
}
window.FlashVPAID = FlashVPAID;

