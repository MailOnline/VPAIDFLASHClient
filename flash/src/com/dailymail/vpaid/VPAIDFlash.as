package com.dailymail.vpaid
{
	import com.dailymail.vpaid.VPAIDWrapper;
	
	import flash.display.DisplayObject;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.external.ExternalInterface;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	import br.com.stimuli.loading.BulkLoader;
	
	public class VPAIDFlash extends Sprite
	{
		private var textField:TextField;
		
		private var jsHandler:String;
		private var flashID:String;
		private var marshallExceptions:Boolean;
		
		private var adURL:String;	
		private var adLoader:BulkLoader;
		private var adContent:DisplayObject;
		private var vpaidWrapper:VPAIDWrapper;
		
		
		public function VPAIDFlash()
		{
			var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
			jsHandler = paramObj.handler;
			flashID = paramObj.flashid;
			marshallExceptions = paramObj.marshallExceptions === 'true';
			
			if (paramObj.debug) {
				debugMode();	
			}
			
			logDebug("ExternalInterface.available:" + ExternalInterface.available + ", paramObj.handler:" + jsHandler + ", paramObj.flashid:" + paramObj.flashid);
			
			adLoader = new BulkLoader('adLoader', 1);
			if (ExternalInterface.available) {
				addVPAIDInterface();
				ExternalInterface.call(jsHandler, flashID, 'handShake', 'prepared');
			}
		}
		
		private function debugMode():void {
			textField = new TextField();
			textField.width = 250;
			textField.height = 250;
			textField.multiline = true;
			textField.wordWrap = true;
			textField.setTextFormat(new TextFormat(null, 16));
			this.addChild(textField);
			
		}
		
		private function logDebug(msg:String, erase:Boolean = false):void {
			if (textField) {
				if (!erase) {
					msg = textField + '///' + msg; 
				}
				textField.text = msg;
			}
		}
		
		private function loadAdUnit(url):void {
			adURL = url;
			textField.text = url;
			var loadItem:IEventDispatcher = adLoader.add(url, {maxTries: 1, type: BulkLoader.TYPE_MOVIECLIP});
			loadItem.addEventListener(BulkLoader.ERROR, onLoadAdUnitError);
			loadItem.addEventListener(BulkLoader.COMPLETE, onLoadAdUnit);
			if (!adLoader.isRunning) adLoader.start();
		}
		
		private function onLoadAdUnit(evt:Event):void {
			adContent = adLoader.getContent(adURL, true);
			addChild(adContent);
			vpaidWrapper = new VPAIDWrapper(adContent);
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				adContent.addEventListener(event, dispatchEvent);
			});
		}
		
		private function onLoadAdUnitError(evt:ErrorEvent):void {
			logDebug(evt.text);
			ExternalInterface.call(jsHandler, flashID, 'error', evt.toString());
		}
		
		private function addVPAIDInterface():void {
			var callbacks:Array = new Array(
				//methods
				{event: 'initAd', 			handler: proxyAdMethod, 	type: 'method'},
				{event: 'resizeAd', 		handler: proxyAdMethod, 	type: 'method'},
				{event: 'startAd', 			handler: proxyAdMethod, 	type: 'method'},
				{event: 'stopAd', 			handler: proxyAdMethod, 	type: 'method'},
				{event: 'pauseAd', 			handler: proxyAdMethod, 	type: 'method'},
				{event: 'resumeAd', 		handler: proxyAdMethod, 	type: 'method'},
				{event: 'expandAd', 		handler: proxyAdMethod, 	type: 'method'},
				{event: 'collapseAd', 		handler: proxyAdMethod, 	type: 'method'},
				{event: 'skipAd', 			handler: proxyAdMethod, 	type: 'method'},
				//properties that will be handled 
				{event: 'adLinear', 		handler: proxyAdProperty,	type: 'property'},
				{event: 'adWidth', 			handler: proxyAdProperty, 	type: 'property'},
				{event: 'adHeight', 		handler: proxyAdProperty, 	type: 'property'},
				{event: 'adExpanded', 		handler: proxyAdProperty, 	type: 'property'},
				{event: 'adSkippableState', handler: proxyAdProperty, 	type: 'property'},
				{event: 'adRemainingTime', 	handler: proxyAdProperty, 	type: 'property'},
				{event: 'adDuration', 		handler: proxyAdProperty, 	type: 'property'},
				{event: 'adVolume', 		handler: proxyAdProperty, 	type: 'property'},
				{event: 'adCompanions', 	handler: proxyAdProperty, 	type: 'property'},
				{event: 'adIcons', 			handler: proxyAdProperty, 	type: 'property'}
			);
			
			//check if is better to use this on or off
			ExternalInterface.marshallExceptions = marshallExceptions;
			
			ExternalInterface.addCallback('loadAdUnit', loadAdUnit);
			
			callbacks.forEach(function (item:*, index:int, arr:Array):void {
				logDebug('addCallback:' + item.event);
				try {
					if (item.type == 'method') {
						ExternalInterface.addCallback(item.event, function (message:*):void {
							item.handler(item.event, message);
						});
					}else {
						ExternalInterface.addCallback(item.event, function ():void {
							item.handler(item.event);
						});
					}
				}catch (e:Error){
					ExternalInterface.call(jsHandler, flashID, 'error', e);
					logDebug('addCallback error:' + e.message, true);
				}
			}, this);
		}
		
		private function proxyAdMethod(EventType:String, message:*):void {
			if (adContent) {
				adContent[EventType](message);
			}
		}
		
		private function proxyAdProperty(EventType:String):void {
			if (adContent) {
				try {
					var result:* = adContent[EventType];
				} catch(e:Error) {
					ExternalInterface.call(jsHandler, flashID, 'error', e);
					logDebug('proxyAdProperty error:' + e.message, true);
				}
				
				ExternalInterface.call(jsHandler, flashID, EventType, result);
			}
		}
		
		private function dispatchEvent(e:VPAIDEvent):void {
			ExternalInterface.call(jsHandler, flashID, e.type, e.data);
		}
	}
}