import type { GamepadRelay } from "bandijoystick";

export function createGamepadRelayButton( host:HTMLDivElement, key:GamepadRelay ) {
	host.style.transition = "background-color .5s, opacity .2s";

	const led = ( intensity:number ) => {
		host.style.backgroundColor = intensity>0? key.config.background ?? "green" : "#222";
		host.style.opacity = `${intensity*100}%`;
	}

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