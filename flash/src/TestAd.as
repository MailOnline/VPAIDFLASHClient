package
{
	import com.dailymail.vpaid.IVPAID;
	
	import flash.display.Sprite;
	
	public class TestAd extends Sprite implements IVPAID
	{
		private var volume:Number = 0;
		
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
			return 0;
		}
		
		public function get adHeight():Number
		{
			return 0;
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
			return volume;
		}
		
		public function set adVolume(volume:Number):void
		{
			this.volume = volume;
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
			return '';
		}
		
		public function initAd(width:Number, height:Number, viewMode:String, desiredBitrate:Number, creativeData:String='', environmentVars:String=''):void
		{
		}
		
		public function resizeAd(width:Number, height:Number, viewMode:String):void
		{
		}
		
		public function startAd():void
		{
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