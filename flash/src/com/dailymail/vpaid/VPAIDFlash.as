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
		private const NO_AD:String = 'noAd';
		private const ERROR:String = 'error';
		
		private var textField:TextField;
		
		private var jsHandler:String;
		private var flashID:String;
		
		private var adURL:String;	
		private var adLoader:BulkLoader;
		private var adContent:DisplayObject;
		private var vpaidWrapper:VPAIDWrapper;
		
		
		public function VPAIDFlash()
		{
			var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
			jsHandler = paramObj.handler;
			flashID = paramObj.flashid;
			
			if (paramObj.debug !== 'false') {
				debugMode();
			}
			
			logDebug("paramObj.handler:" + jsHandler + ", paramObj.flashid:" + paramObj.flashid);
			
			adLoader = new BulkLoader('adLoader', 1);
			if (ExternalInterface.available) {
				ExternalInterface.marshallExceptions = paramObj.marshallExceptions === 'true';
				
				addVPAIDInterface();
				callInterface('method', 'handShake', '', null, 'prepared');
			}else {
				logDebug('no external interface available', true);
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
					msg = textField.text + '\n$ ' + msg; 
				}
				textField.text = msg;
			}
		}
		
		private function loadAdUnit(callID:String, url:String):void {
			adURL = url;
			logDebug(url, true);
			var loadItem:LoadingItem = adLoader.add(url, {maxTries: 1, type: BulkLoader.TYPE_MOVIECLIP});
			loadItem.addEventListener(BulkLoader.ERROR, function (event):void {
				onLoadAdUnitError(callID, event);
			});
			loadItem.addEventListener(BulkLoader.COMPLETE, function (event):void {
				onLoadAdUnit(callID, event);
			});
			if (!adLoader.isRunning) adLoader.start();
		}
		
		private function onLoadAdUnit(callID:String, evt:Event):void {
			adContent = adLoader.getContent(adURL, true);
			addChild(adContent);
			vpaidWrapper = new VPAIDWrapper(adContent);
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				vpaidWrapper.addEventListener(event, dispatchEvent);
			});
			callInterface('method', 'loadAdUnit', callID, null, true);
		}
		
		private function onLoadAdUnitError(callID:String, evt:ErrorEvent):void {
			logDebug(evt.text);
			callInterface('method', 'loadAdUnit', callID, evt, true);
		}
		
		private function unloadAdUnit(callID:String, evt:Event):void {
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				vpaidWrapper.removeEventListener(event, dispatchEvent);
			});
			removeChild(adContent);
			adContent = null;
			vpaidWrapper = null;
			callInterface('method', 'unloadAdUnit', callID, null, true);
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
				{event: 'adLinear', 		handler: proxyAdGetterProperty,		type: 'property'},
				{event: 'adWidth', 			handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adHeight', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adExpanded', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adSkippableState', handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adRemainingTime', 	handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adDuration', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adVolume', 		handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'getAdVolume', 		handler: proxyAdGetterProperty, 	type: 'property', mapAction: 'adVolume'},
				{event: 'setAdVolume', 		handler: proxyAdSetterProperty, 	type: 'property', mapAction: 'adVolume'},
				{event: 'adCompanions', 	handler: proxyAdGetterProperty, 	type: 'property'},
				{event: 'adIcons', 			handler: proxyAdGetterProperty, 	type: 'property'}
			);
			
			//special callbacks
			ExternalInterface.addCallback('loadAdUnit', function (message:Array):void {
				loadAdUnit.apply(this, message);
			});
			ExternalInterface.addCallback('unloadAdUnit', function (message:Array):void {
				unloadAdUnit.apply(this, message);
			});
			
			callbacks.forEach(function (item:*, index:int, arr:Array):void {

				ExternalInterface.addCallback(item.event, function (message:Array):void {
					//callbackID, message
					var callbackID:String = message.shift();
					proxyAd(function ():* {
						
						return item.handler.apply(this, [item.mapAction || item.event].concat(message));

					}, item.type, item.event, callbackID);
				});
			}, this);
		}
		
		private function proxyAd(adAction:Function, actionType:String, actionName:String, callbackID:String):void {
			if (vpaidWrapper) {
				safeCall(adAction, function (err, result):void {
					callInterface(actionType, actionName, callbackID, err, result);
				});
			}else {
				callInterface(actionType, actionName, callbackID, NO_AD, null);
			}
		}
		
		private function proxyAdMethod(methodType:String, message:*):* {
			return vpaidWrapper[methodType](message);
		}
		
		private function proxyAdGetterProperty(propertyType:String):* {
			return vpaidWrapper[propertyType];
		}
		
		private function proxyAdSetterProperty(propertyType:String, value:*):* {
			vpaidWrapper[propertyType] = value;
			return vpaidWrapper[propertyType];
		}

		private function safeCall(func:Function, done:Function):void {
			var err:Error = null;
			var result:*;
			try {
				result = func();
			}catch (e) {
				err = e;
			}
			done(err, result);
		}
		
		private function callInterface(type:String, typeID:String, callbackID:String, error:* = null, result:* = null):void {
			ExternalInterface.call(jsHandler, flashID, type, typeID, callbackID, error, result);
			logDebug('jsHandler: ' + jsHandler + ' flashID: ' + flashID + ' type:' + type + '  typeID: ' + typeID +' callbackID: ' + callbackID + ' error: ' + error + ' result: ' + result);
			if (type == ERROR) {
				logDebug('proxyAdProperty error:' + result.message, true);
			}
		}
		
		private function dispatchEvent(e:VPAIDEvent):void {
			callInterface('event', e.type, '', null, e.data);
		}
	}
}

