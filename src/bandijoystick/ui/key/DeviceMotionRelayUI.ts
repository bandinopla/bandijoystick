import type { DeviceMotionRelay } from "bandijoystick";
import { createLED } from "../utils/led";

export function createDeviceMotionRelayUI( host:HTMLDivElement, key:DeviceMotionRelay )
{ 
	const led = createLED(host, key.config.background); 
	let intrvl = 0;

	const onData = ()=>{
		clearInterval(intrvl);
		led(1);
		intrvl = window.setTimeout(()=>led(0.5),500);
	}

	key.motion.on( onData );

	return ()=>{
		key.motion.off( onData );
	}
}