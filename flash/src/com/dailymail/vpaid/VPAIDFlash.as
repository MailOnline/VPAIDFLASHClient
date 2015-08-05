package com.dailymail.vpaid
{
	import com.dailymail.vpaid.VPAIDWrapper;
    import com.dailymail.vpaid.LoaderFacade;

	import flash.display.DisplayObject;
	import flash.display.LoaderInfo;
	import flash.display.Sprite;
	import flash.events.Event;
    import flash.events.TextEvent;
	import flash.external.ExternalInterface;
	import flash.text.TextField;
	import flash.text.TextFormat;
    import flash.system.Security;

	public class VPAIDFlash extends Sprite
	{
		private const NO_AD:String = 'noAd';
		private const ERROR:String = 'adError';

		private var textField:TextField;

		private var jsHandler:String;
		private var flashID:String;

		private var adURL:String;
        private var loader:LoaderFacade;
		private var adContent:DisplayObject;
		private var vpaidWrapper:VPAIDWrapper;


		public function VPAIDFlash()
		{
			var paramObj:Object = LoaderInfo(this.root.loaderInfo).parameters;
			jsHandler = paramObj.handler;
			flashID = paramObj.flashid;
			stage.align = paramObj.salign || stage.align;

            //temporary fix test to check if will fix issues with different domains
            Security.allowDomain("*");
            Security.allowInsecureDomain("*");

			if (paramObj.debug !== 'false') {
				debugMode();
			}

			logDebug("paramObj.handler:" + jsHandler + ", paramObj.flashid:" + paramObj.flashid);

            loader = new LoaderFacade();
            addChild(loader);
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
			trace(msg);
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
            loader.load(
                url,
                function(e:Event):void {
                    onLoadAdUnit(callID, e);
                },
                function(e:TextEvent):void {
                    onLoadAdUnitError(callID, e);
                }
            );
		}


		private function onLoadAdUnit(callID:String, evt:Event):void {
			adContent = loader.content;
			vpaidWrapper = new VPAIDWrapper(adContent);
			VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
				vpaidWrapper.addEventListener(event, dispatch);
			});
			callInterface('method', 'loadAdUnit', callID, null, true);
		}

		private function onLoadAdUnitError(callID:String, evt:TextEvent):void {
			logDebug(evt.text);
			callInterface('method', 'loadAdUnit', callID, evt, true);
		}

		private function unloadAdUnit(callID:String):void {
			//if is already loaded
			if (vpaidWrapper) {
				VPAIDEvent.ALL_EVENTS.forEach(function (event:*, index:int, arr:Array):void {
					vpaidWrapper.removeEventListener(event, dispatch);
				});
				adContent = null;
				vpaidWrapper = null;
			}

            loader.unload();
			callInterface('method', 'unloadAdUnit', callID, null, true);
		}

		private function addVPAIDInterface():void {
			var callbacks:Array = new Array(

				//methods
				{event: 'handshakeVersion',     handler: proxyAdMethod,             type: 'method'},
				{event: 'initAd',               handler: proxyAdMethod,             type: 'method'},
				{event: 'resizeAd',             handler: proxyAdMethod,             type: 'method'},
				{event: 'startAd',              handler: proxyAdMethod,             type: 'method'},
				{event: 'stopAd',               handler: proxyAdMethod,             type: 'method'},
				{event: 'pauseAd',              handler: proxyAdMethod,             type: 'method'},
				{event: 'resumeAd',             handler: proxyAdMethod,             type: 'method'},
				{event: 'expandAd',             handler: proxyAdMethod,             type: 'method'},
				{event: 'collapseAd',           handler: proxyAdMethod,             type: 'method'},
				{event: 'skipAd',               handler: proxyAdMethod,             type: 'method'},
				//properties that will be handled
				{event: 'getAdLinear',          handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adLinear'},
				{event: 'getAdWidth',           handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adWidth'},
				{event: 'getAdHeight',          handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adHeight'},
				{event: 'getAdExpanded',        handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adExpanded'},
				{event: 'getAdSkippableState',  handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adSkippableState'},
				{event: 'getAdRemainingTime',   handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adRemainingTime'},
				{event: 'getAdDuration',        handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adDuration'},
				{event: 'getAdVolume',          handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adVolume'},
				{event: 'setAdVolume',          handler: proxyAdSetterProperty,     type: 'property', mapAction: 'adVolume'},
				{event: 'getAdCompanions',      handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adCompanions'},
				{event: 'getAdIcons',           handler: proxyAdGetterProperty,     type: 'property', mapAction: 'adIcons'}
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
				safeCall(adAction, function (err:Error, result:*):void {
					callInterface(actionType, actionName, callbackID, err, result);
				});
			} else {
				callInterface(actionType, actionName, callbackID, NO_AD, null);
			}
		}

		private function proxyAdMethod(methodType:String, ...message):* {
			return vpaidWrapper[methodType].apply(vpaidWrapper, message);
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
			} catch (e:Error) {
				err = e;
			}
			done(err, result);
		}

		private function callInterface(type:String, typeID:String, callbackID:String, error:* = null, result:* = null):void {
			ExternalInterface.call(jsHandler, flashID, type, typeID, callbackID, error, result);
			logDebug('jsHandler: ' + jsHandler + ' flashID: ' + flashID + ' type:' + type + '  typeID: ' + typeID +' callbackID: ' + callbackID + ' error: ' + error + ' result: ' + result);
			if (error) {
				logDebug('proxyAdProperty error:' + error.message, true);
				trace(error);
			}
		}

		private function dispatch(e:Event):void {
			var event:VPAIDEvent = VPAIDEvent.convertVPAIDEvent(e);
			callInterface('event', event.type, '', null, event.data);
		}
	}
}

