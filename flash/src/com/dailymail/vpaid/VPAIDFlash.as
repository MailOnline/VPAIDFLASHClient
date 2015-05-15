package com.dailymail.vpaid
{
	import com.dailymail.vpaid.VPAIDWrapper;
	
	import flash.display.DisplayObject;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.text.TextField;
	import flash.text.TextFormat;
	
	import br.com.stimuli.loading.BulkLoader;
	import br.com.stimuli.loading.loadingtypes.LoadingItem;
	
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
				ExternalInterface.call(jsHandler, flashID, 'method', 'handShake', 'prepared');
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
		
		private function loadAdUnit(callID:String, url:String):void {
			var self:VPAIDFlash = this;
			adURL = url;
			logDebug(url, true);
			var loadItem:LoadingItem = adLoader.add(url, {maxTries: 1, type: BulkLoader.TYPE_MOVIECLIP});
			loadItem.addEventListener(BulkLoader.ERROR, function (event):void {
				onLoadAdUnitError.call(self, callID, event);
			});
			loadItem.addEventListener(BulkLoader.COMPLETE, function (event):void {
				onLoadAdUnit.call(self, callID, event);
			});
			if (!adLoader.isRunning) adLoader.start();
		}
		
		private function onLoadAdUnit(callID:String, evt:Event):void {
			adContent = adLoader.getContent(adURL, true);
			addChild(adContent);
			vpaidWrapper = new VPAIDWrapper(adContent);
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				adContent.addEventListener(event, dispatchEvent);
			});
			ExternalInterface.call(jsHandler, flashID, 'method', 'loadAdUnit', callID, true);
		}
		
		private function onLoadAdUnitError(callID:String, evt:ErrorEvent):void {
			logDebug(evt.text);
			ExternalInterface.call(jsHandler, flashID, 'error', 'loadAdUnit', evt.toString());
		}
		
		private function unloadAdUnit(callID:String, evt:Event):void {
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				adContent.removeEventListener(event, dispatchEvent);
			});
			removeChild(adContent);
			adContent = null;
			ExternalInterface.call(jsHandler, flashID, 'method', 'unloadAdUnit', callID, true);
		}
		
		private function addVPAIDInterface():void {
			var self:VPAIDFlash = this;
			
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
				{event: 'adLinear', 		handler: proxyAdGetterProperty,		type: 'property'},
				{event: 'adWidth', 			handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adHeight', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adExpanded', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adSkippableState', handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adRemainingTime', 	handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adDuration', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adVolume', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'getAdVolume', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'setAdVolume', 		handler: proxyAdSetterProperty, 	type: 'property'},
				{event: 'adCompanions', 	handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adIcons', 			handler: proxyAdGetterProperty, 	type: 'property'}
			);
			
			//check if is better to use this on or off
			ExternalInterface.marshallExceptions = marshallExceptions;
			
			//special callbacks
			ExternalInterface.addCallback('loadAdUnit', function (message:Array):void {
				loadAdUnit.apply(self, message);
			});
			ExternalInterface.addCallback('unloadAdUnit', function (message:Array):void {
				unloadAdUnit.apply(self, message);
			});
			
			callbacks.forEach(function (item:*, index:int, arr:Array):void {
				logDebug('addCallback:' + item.event);
				try {
					if (item.type == 'method') {
						ExternalInterface.addCallback(item.event, function (message:Array):void {
							item.handler.apply(self, [item.event].concat(message));
						});
					}else {
						ExternalInterface.addCallback(item.event, function (message:Array):void {
							item.handler.apply(self, [item.event].concat(message));
						});
					}
				}catch (e:Error){
					ExternalInterface.call(jsHandler, flashID, 'error', item.type, e);
					logDebug('addCallback error:' + e.message, true);
				}
			}, this);
		}
		
		private function proxyAdMethod(EventType:String, callID:String, message:*):void {
			if (adContent) {
				adContent[EventType](message);
			}
		}
		
		private function proxyAdGetterProperty(propertyType:String, callID:String):void {
			if (adContent) {
				try {
					var result:* = adContent[propertyType];
				} catch(e:Error) {
					ExternalInterface.call(jsHandler, flashID, 'error', propertyType, callID, e);
					logDebug('proxyAdProperty error:' + e.message, true);
				}
				
				ExternalInterface.call(jsHandler, flashID, 'property', propertyType, callID, result);
			}
		}
		
		private function proxyAdSetterProperty(propertyType:String, callID:String, value:*):void {
			if (adContent) {
				try {
					adContent[propertyType] = value;
				} catch(e:Error) {
					ExternalInterface.call(jsHandler, flashID, 'error', propertyType, callID, e);
					logDebug('proxyAdProperty error:' + e.message, true);
				}
			}
		}
		
		private function dispatchEvent(e:VPAIDEvent):void {
			ExternalInterface.call(jsHandler, flashID, 'event', e.type, e.data);
		}
	}
}