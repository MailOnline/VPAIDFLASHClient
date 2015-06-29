VPAIDFLASHClient
==========
[![Code Climate](https://codeclimate.com/github/MailOnline/VPAIDFLASHClient/badges/gpa.svg)](https://codeclimate.com/github/MailOnline/VPAIDFLASHClient)
[![Build Status](https://travis-ci.org/MailOnline/VPAIDFLASHClient.svg?branch=master)](https://travis-ci.org/MailOnline/VPAIDFLASHClient)

About
===============
JS + Flash wrapper for [VPAID](http://www.iab.net/vpaid).

[VPAID](http://www.iab.net/vpaid) or *Video Player Ad-Serving Interface Definition*, establishes a common interface between video players and ad units, enabling a rich interactive in-stream ad experience.

Because some of the ad's are in flash, this projects will allow to expose the api to be used by js.

**JS** is responsible of:
  - create a **uniqueid** for the vpaid and request swfobject to load the swf
  - to do the bridge between vpaid api between flash and js using [ExternalInterface](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/external/ExternalInterface.html)
  - for security reasons the swf will not be allowed to communicate with flash if not excuting in the server

**Flash** is responsible of:
  - load the ad Unit
  - expose ad Unit interface to outside
  - using the **uniqueid** to identify the swf

The goals of **VPAIDFLASHClient** are:
  - common interface for VPAID in different technologies [HTML5](https://github.com/MailOnline/VPAIDHTML5Client) and [FLASH](https://github.com/MailOnline/VPAIDFLASHClient).
  - handle how to load the VPAID adUnit
  - be a simple and "stupid" implementation of VPAID

check [videosjs-vast-vpaid](https://github.com/MailOnline/videojs-vast-vpaid) if you need VPAID in [videojs](https://github.com/videojs/video.js)

TODO
===============
  - try to implement flex unit tests
  - compile flash without needing to use flashbuilder
  - create test coverage (not done yet because of [karma coverage - issue #123](https://github.com/karma-runner/karma-coverage/issues/123))

JS
==

The project uses:
  - [gulpjs](http://gulpjs.com/) to compile.
  - [babeljs](https://babeljs.io) to convert es6 to es5 js code.

3rd party
---------
  - [swfobject googlecode](https://code.google.com/p/swfobject/) or [swfobject github](https://github.com/swfobject/swfobject)

Flash
==============

The flash code was compiled with [FlashBuilder](http://www.adobe.com/uk/products/flash-builder.html), but can be as compiled with [FlashDevelop](http://www.flashdevelop.org/) or with [Flex SDK](http://www.adobe.com/devnet/flex/flex-sdk-download.html).

3rd party
---------
  - [BulkLoader](https://github.com/arthur-debert/BulkLoader) - BulkLoader is a minimal library written in Actionscript 3 (AS3) that aims to make loading and managing complex loading requirements easier and faster

Debug
=====
  - when creating a VPAIDFLASHClient instance the last parameter is debug, if this flag is set to true, will create a visual textfield that allows to show errors
  - as well if the js+flash is working all errors catch by the VPAIDFlash.swf will be sent to js
  - other error's can be caugth with Flash debugger

Flash debugger
--------------
Allows to flash to throw errors in a popup like window. To install go to [adobe support page](https://www.adobe.com/support/flashplayer/downloads.html) and install the flash player with **content debugger** in the name for the correct OS.
PS:
  - in Google Chrome the Flash debugger is not working (the last time I tried), I found an [*issue* in chromium](https://code.google.com/p/chromium/issues/detail?id=478056), so install in Firefox or other if not working for you in Google Chrome.

Running the project
===================

  - install nodejs, bower and gulp
  - `npm install` and `bower install` to install all dependencies
  - `gulp serve` or `npm start` to start build script and a demo page should be open in default browser
  - `gulp` to watch, bundle and run tests
  - `npm test` or `gulp test:ci` task used by the server

Example of the usage
==========================================

```javascript
var flashVPaid = new VPAIDFLASHClient(element, flashVPAIDWrapperLoaded);
function flashVPAIDWrapperLoaded(err, result) {
    if (err) {
        //handle error here
        return;
    }

    flashVPaid.loadAdUnit('TestAd.swf', function (error, adUnit) {

        if (err) {
            //handle error here
            return;
        }

        adUnit.on('AdLoaded', function (err, result) {
            console.log('event:AdLoaded', err, result);
            startAd();
        });

        adUnit.on('AdStarted', function (err, result) {
            console.log('event:AdStarted', err, result);
            checkAdProperties();
        });

        adUnit.handshakeVersion('2.0', function (err, result) {
            initAd();
        });

        function initAd() {
            adUnit.initAd(0, 0, 'normal', -1, '', '', function (err) {
                console.log('initAd', err);
            });
        }

        function startAd() {
            adUnit.startAd(function (err, result) {
                console.log('startAd call', err, result);
            });
        }

        function checkAdProperties() {
            adUnit.getAdIcons(function (err, result) {
                console.log('getAdIcons', result);
            });
            adUnit.setAdVolume(10, function (err, result) {
                console.log('setAdVolume', result);
            });
            adUnit.getAdVolume(function (err, result) {
                console.log('getAdVolume', result);
            });
        }

    });
}
```

for the api of VPAIDFLASHClient check [VPAIDFLASHClient.js](js/VPAIDFLASHClient.js), for adUnit api check [IVPAIDAdUnit.js](js/IVPAIDAdUnit.js).

License
=======
licensed under the MIT License, Version 2.0. [View the license file](LICENSE.md)

Copyright &copy; 2015 MailOnline

