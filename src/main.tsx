import { isMobileByUserAgent } from './utils/isMobile'  


if ( isMobileByUserAgent() ) {

	//
	// mobile app | the UI for the joystick in the phone
	//
	import("./bandijoystick/RemoteJoystickUI");

}
else 
{
	//
	// the website
	//
	import("./App"); 
	 
} 
