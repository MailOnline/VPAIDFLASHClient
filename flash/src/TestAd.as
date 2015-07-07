package
{
	import com.dailymail.vpaid.IVPAID;
	import com.dailymail.vpaid.VPAIDEvent;

	import flash.display.Sprite;
	import flash.utils.setTimeout;

	public class TestAd extends Sprite implements IVPAID
	{
		private var _volume:Number = 0;
		private var _width:Number = 0;
		private var _height:Number = 0;

		public function TestAd()
		{
			super();
		}

		public function get adLinear():Boolean
		{
			return false;
		}

		public function get adWidth():Number
		{
			return _width;
		}

		public function get adHeight():Number
		{
			return _height;
		}

		public function get adExpanded():Boolean
		{
			return false;
		}

		public function get adSkippableState():Boolean
		{
			return false;
		}

		public function get adRemainingTime():Number
		{
			return 0;
		}

		public function get adDuration():Number
		{
			return 0;
		}

		public function get adVolume():Number
		{
			return _volume;
		}

		public function set adVolume(volume:Number):void
		{
			_volume = volume;
		}

		public function get adCompanions():String
		{
			return '';
		}

		public function get adIcons():Boolean
		{
			return false;
		}

		public function handshakeVersion(playerVPAIDVersion:String):String
		{
			return '2.0';
		}

		public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number, creativeData:String='', environmentVars:String=''):void
		{
			setTimeout(function ():void {
				dispatchEvent(new VPAIDEvent(VPAIDEvent.AdLoaded, {}));
			}, 1);
		}

		public function resizeAd(width:Number, height:Number, viewMode:String):void
		{
		}

		public function startAd():void
		{
			setTimeout(function ():void {
				dispatchEvent(new VPAIDEvent(VPAIDEvent.AdStarted, {}));
			}, 1);
		}

		public function stopAd():void
		{
		}

		public function pauseAd():void
		{
		}

		public function resumeAd():void
		{
		}

		public function expandAd():void
		{
		}

		public function collapseAd():void
		{
		}

		public function skipAd():void
		{
		}
	}
}
