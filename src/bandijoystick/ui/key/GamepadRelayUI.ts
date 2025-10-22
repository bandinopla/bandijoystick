import type { GamepadRelay } from "bandijoystick";
import { createLED } from "../utils/led";

export function createGamepadRelayButton( host:HTMLDivElement, key:GamepadRelay ) { 
	const led = createLED(host, key.config.background); 

	const onPadConnected = (isConnected:boolean) => led(isConnected?1:0);
	let intrvl = 0;

	const onData = ()=>{
		clearInterval(intrvl);
		led(1);
		intrvl = window.setTimeout(()=>led(0.5),500);
	}
	
	key.padConnected.on( onPadConnected )
	key.buttonsChanged.on( onData );
	key.axesChanged.on( onData );

	return ()=>{
		clearInterval(intrvl);
		key.padConnected.off( onPadConnected )
		key.buttonsChanged.off( onData );
		key.axesChanged.off( onData );
	};
}