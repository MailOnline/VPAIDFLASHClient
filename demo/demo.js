'use strict';

var VPAIDFLASHClient = require('../js/VPAIDFLASHClient');

var flashVPaid = new VPAIDFLASHClient(document.getElementById('myContent'), flashVPAIDWrapperLoaded);

function flashVPAIDWrapperLoaded(err) {
    if (err) return;
    // var adURL = 'http://cdn.innovid.com/2.62.8110/platform/vpaid/VPAIDIRollPackage.swf?configURL=http%3A%2F%2Fstatic.innovid.com%2Firoll%2Fconfig%2F1hl7lc.xml%3Fcb%3D787766d7-ebab-3656-c24f-0ddebab645e9&secure=false';
    // var adURL = 'VPAIDIRollPackage.swf?configURL=http%3A%2F%2Fstatic.innovid.com%2Firoll%2Fconfig%2F1hl7lc.xml%3Fcb%3D787766d7-ebab-3656-c24f-0ddebab645e9&secure=false';
    // var adURL = 'TestAd.swf';
    var adURL = 'http://cdn-sys.brainient.com/flash/v6/select846.swf?video_id=a3f30b8e-2ad8-4123-bc58-42fccb3e48cd&user_id=1228&tzone=&settings=json&settingsPath=http://cdn-tags.brainient.com/1228/a3f30b8e-2ad8-4123-bc58-42fccb3e48cd/config.json';
    // var adURL = 'http://shim.btrll.com/shim/20150715.85603_master/Scout.swf?asset_64=aHR0cDovL2NhY2hlLmJ0cmxsLmNvbS9wcm9kdWN0L3Rlc3QvdmFzdF93cmFwcGVyL2JyLXZhc3Rfd3JhcHBlci54bWw&vid_click_url=&h_64=YnJ4c2Vydi0yMi5idHJsbC5jb20&e=p&config_url_64=&type=VAST_TAG&vh_64=bWhleHQtMjIuYnRybGwuY29t&p=6834995&s=3863356&l=28043&ic=51223&ii=6594&x=TbBvLqwwDICcRVsPZkAABtiwAAyBcAOvM8AAAAAABhtJT2o-vMJQ&cx=&dn=&hidefb=true&iq=t&adc=false&si=&t=33&apep=0.03&hbp=0.01&epx=&ps=0.0&view=vast2&woid=____________________________________';
    flashVPaid.loadAdUnit(adURL, function (error, adUnit) {
        if (error) return;

        adUnit.handshakeVersion('2.0', initAd);
        adUnit.on('AdLoaded', startAd);

        adUnit.on('AdStarted', function (err, result) {
            console.log('event:AdStarted', err, result);
            checkAdProperties();
        });
        console.log('adUnitLoaded');

        function initAd(err, result) {
            console.log('handShake', err, result);
            adUnit.initAd(800, 400, 'normal', -1, '', '', function (err) {
                console.log('initAd', err);
            });
        }

        function startAd(err, result) {
            console.log('event:AdLoaded', err, result);
            adUnit.startAd(function (err, result) {
                console.log('startAd call', err, result);
            });
        }

        function checkAdProperties() {
            adUnit.getAdIcons(function (err, result) {
                console.log('getAdIcons', result);
            });
            adUnit.setAdVolume(.8, function (err, result) {
                console.log('setAdVolume', result);

                setTimeout(function () {
                    adUnit.setAdVolume(0);
                }, 2000);


                setTimeout(function () {
                    adUnit.setAdVolume(1);
                }, 5000);
            });
            adUnit.getAdVolume(function (err, result) {
                console.log('getAdVolume', result);
            });
        }

    });
}
