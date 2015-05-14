package com.dailymail.vpaid
{
	import flash.events.EventDispatcher;
	
	public class VPAIDWrapper extends EventDispatcher implements IVPAID
	{
		private var ad:*;
		
		public function VPAIDWrapper(ad)
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
			return ad.adLinear();
		}
		
		public function get adWidth():Number
		{
			return ad.adWidth();
		}
		
		public function get adHeight():Number
		{
			return ad.adHeight();
		}
		
		public function get adExpanded():Boolean
		{
			return ad.adExpanded();
		}
		
		public function get adSkippableState():Boolean
		{
			return ad.adSkippableState();
		}
		
		public function get adRemainingTime():Number
		{
			return ad.adSkippableState();
		}
		
		public function get adDuration():Number
		{
			//TODO: implement function
			return 0;
		}
		
		public function get adVolume():Number
		{
			//TODO: implement function
			return 0;
		}
		
		public function get adCompanions():String
		{
			//TODO: implement function
			return null;
		}
		
		public function get adIcons():Boolean
		{
			//TODO: implement function
			return false;
		}
		
		public function handshakeVersion(playerVPAIDVersion:String):String
		{
			//TODO: implement function
			return null;
		}
		
		public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number, creativeData:String='', environmentVars:String=''):void
		{
			//TODO: implement function
		}
		
		public function resizeAd(width:Number, height:Number, viewMode:String):void
		{
			//TODO: implement function
		}
		
		public function startAd():void
		{
			//TODO: implement function
		}
		
		public function stopAd():void
		{
			//TODO: implement function
		}
		
		public function pauseAd():void
		{
			//TODO: implement function
		}
		
		public function resumeAd():void
		{
			//TODO: implement function
		}
		
		public function expandAd():void
		{
			//TODO: implement function
		}
		
		public function collapseAd():void
		{
			//TODO: implement function
		}
		
		public function skipAd():void
		{
			//TODO: implement function
		}
	}
}