package com.dailymail.vpaid
{
	import com.dailymail.vpaid.VPAIDWrapper;

	import flash.display.DisplayObject;
	import flash.display.LoaderInfo;
    import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.ErrorEvent;
    import flash.events.TextEvent;
	import flash.events.Event;
    import flash.events.IOErrorEvent;
    import flash.net.URLRequest;

	public class LoaderFacade extends Sprite
	{
		private const NO_AD:String = 'noAd';
		private const ERROR:String = 'adError';

        private var successHandler:Function;
        private var errorHandler:Function;

        private var isLoading:Boolean = false;
        private var isLoaded:Boolean = false;
        private var loader:Loader = new Loader();

		public function LoaderFacade()
		{
            addChild(loader);
        }

        public function load(url:String, success:Function, error:Function):void {
            isLoading = true;
            successHandler = success;
            errorHandler = error;
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onError);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onSuccess);
            loader.load(new URLRequest(url));
        }

        public function unload():void {
            removeEvents();
            if (isLoading) {
                loader.close();
            } else if(isLoaded) {
                loader.unloadAndStop();
            }
            isLoaded = false;
            isLoading = false;
        }

        private function onError(e:TextEvent):void {
            errorHandler(e);
            finished();
        }

        private function onSuccess(e:Event):void {
            successHandler(e);
            finished();
        }

        public function get content():DisplayObject {
            return loader.content;
        }

        private function finished():void {
            isLoading = false;
            isLoaded = true;
            removeEvents();
        }

        private function removeEvents():void {
            loader.contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, onError);
            loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onSuccess);
            successHandler = null;
            errorHandler = null;
        }
    }
}

