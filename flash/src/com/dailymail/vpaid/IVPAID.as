package com.dailymail.vpaid
{
	import flash.events.IEventDispatcher;

	public interface IVPAID extends IEventDispatcher
	{
		// Properties
		function get adLinear():Boolean;
		function get adWidth():Number
		function get adHeight():Number
		function get adExpanded():Boolean;
		function get adSkippableState():Boolean;
		function get adRemainingTime():Number;
		function get adDuration():Number;
		function get adVolume():Number;
		function get adCompanions():String;
		function get adIcons():Boolean;
		
		function set adVolume(volume:Number):void;
		
		// Methods
		function handshakeVersion(playerVPAIDVersion : String):String;
		function initAd(width : Number, height : Number, viewMode : String, desiredBitrate : Number, creativeData : String='', environmentVars : String=''):void;
		function resizeAd(width : Number, height : Number, viewMode : String):void;
		function startAd():void;
		function stopAd():void;
		function pauseAd():void;
		function resumeAd():void;
		function expandAd():void;
		function collapseAd():void;
		function skipAd():void;
	}
}