package com.dailymail.vpaid
{
    import flash.events.Event;
    import flash.events.EventDispatcher;
    import flash.media.SoundMixer;
    import flash.media.SoundTransform;

    public class VPAIDWrapper extends EventDispatcher implements IVPAID
    {
        private var ad:*;

        public function VPAIDWrapper(ad:*)
        {
            super();
            if(ad.hasOwnProperty('getVPAID')) {
                this.ad = ad.getVPAID();
            } else {
                this.ad = ad;
            }
        }

        public function get adLinear():Boolean
        {
            return ad.adLinear;
        }

        public function get adWidth():Number
        {
            return ad.adWidth;
        }

        public function get adHeight():Number
        {
            return ad.adHeight;
        }

        public function get adExpanded():Boolean
        {
            return ad.adExpanded;
        }

        public function get adSkippableState():Boolean
        {
            return ad.adSkippableState;
        }

        public function get adRemainingTime():Number
        {
            return ad.adRemainingTime;
        }

        public function get adDuration():Number
        {
            return ad.adDuration;
        }

        public function get adVolume():Number
        {
            return ad.adVolume;
        }

        public function set adVolume(volume:Number):void
        {
            ad.adVolume = volume;

            // some ads don't respect or implement volume, so lets force when mutting at least
            SoundMixer.soundTransform = new SoundTransform((volume === 0) ? 0 : 1);
		}

        public function get adCompanions():String
        {
            return ad.adCompanions;
        }

        public function get adIcons():Boolean
        {
            return ad.adIcons;
        }

        public function handshakeVersion(playerVPAIDVersion:String):String
        {
            return ad.handshakeVersion(playerVPAIDVersion);
        }

        public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number, creativeData:String='', environmentVars:String=''):void
        {
            ad.initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars);
        }

        public function resizeAd(width:Number, height:Number, viewMode:String):void
        {
            ad.resizeAd(width, height, viewMode);
        }

        public function startAd():void
        {
            ad.startAd();
        }

        public function stopAd():void
        {
            ad.stopAd();
        }

        public function pauseAd():void
        {
            ad.pauseAd();
        }

        public function resumeAd():void
        {
            ad.resumeAd();
        }

        public function expandAd():void
        {
            ad.expandAd();
        }

        public function collapseAd():void
        {
            ad.collapseAd();
        }

        public function skipAd():void
        {
            ad.skipAd();
        }

        override public function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void {
            ad.addEventListener(type, listener, useCapture, priority, useWeakReference);
        }

        override public function removeEventListener(type:String, listener:Function, useCapture:Boolean=false):void {
            ad.removeEventListener(type, listener, useCapture);
        }

        override public function dispatchEvent(event:Event):Boolean {
            return ad.dispatchEvent(event);
        }

        override public function hasEventListener(type:String):Boolean {
            return ad.hasEventListener(type);
        }

        override public function willTrigger(type:String):Boolean {
            return ad.willTrigger(type);
        }
    }
}
