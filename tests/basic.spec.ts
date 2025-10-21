import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base';

//
// check if the client connects to the server and key presses are propagated
//
test('Basic interaction', pingPongTester({
	appSetup: async ()=>{

		const slot = new window.BANDI.Joystick("Player1", false);

		const push = new window.BANDI.PushKey({
			id:"push",
			radius:"100px", 
			onClicked:()=>{
				console.log("Push button clicked!!");

				//@ts-ignore
				window.btnClicked = true;
			}
		});

		const dirkey = new window.BANDI.DirKey({
			id:"dirk",
			radius:"100px"
		});

		(window as any).dirKey = dirkey;

		slot.connected.on(()=>{
			console.log("Peer connected!") 
		});
		
		slot.connected.off(()=>{
			console.log("Peer disconnected, bye!")
		});

		const gamepad = new window.BANDI.GamepadRelay({
			id:"gpad",
			radius:"5vw",
			gamepadIndex: 0
		});

		(window as any).gamepadButton = gamepad;

		gamepad.padConnected.on( isConnected => {
			(window as any).gamepadIsConnected = isConnected;
		})

		gamepad.buttonsChanged.on( buttons => {
			if( buttons )
			{
				(window as any).buttonsChaged = buttons;
			}
		})

		gamepad.axesChanged.on( axes => {
			console.log("AXES",axes)
			if( axes )
			{
				(window as any).axesChaged = axes;
			}
		})

		slot.setKeys([ push, dirkey, gamepad ]); 

		return slot.url; 
	},
	phoneInitScript: ()=>{ 
		  console.log("???")
		  window.navigator.getGamepads = () => [{
				 id: "FakePad",
			      index: 0,
			      connected: true,
			      mapping: "standard",
			      buttons: Array.from({ length: 16 }, () => ({ pressed: false, touched:false, value: 0 })) as readonly GamepadButton[],
			      axes: [.1,.2,.3],
			      timestamp: Date.now(),
				  vibrationActuator: {
					pulse:async ()=> false,
			        playEffect: async () => "complete",
			        reset: async () => "complete",
			      },
				  hapticActuators: []
			}];

	},
	tests: [

		//
		// click some keys
		//
		{
			async phone() { 
				
				const slot = new window.BANDI.Joystick("", true); 

				(window as any).slot = slot;

				slot.connected.on(()=>console.log("Connected to app!"));  
				
				return new Promise<void>( resolve => {

					slot.keysChange.on( keys=>{ 

						console.log("Clicking the button...");

						//@ts-ignore
						keys[0].isPressed = true;

						//@ts-ignore
						keys[0].isPressed = false;

						(keys[1] as BANDI.DirKey).x = 12;
						(keys[1] as BANDI.DirKey).y = 34; 

						resolve()

					} );

				} );
			},  
		},

		//
		// was the button press detected?
		//
		{
			async server() {
				return (window as any).btnClicked;
			},
			
			check(what) { 
				expect(what).toBeTruthy();
			},
		},

		//
		// was the directional key detected?
		//
		{
			async server() {
				return (window as any).dirKey.x + (window as any).dirKey.y ;
			},
			
			check(what) { 
				expect(what).toEqual(12+34);
			},
		},

		//
		// was the gamepad relay detected??
		//
		{
			async server() {
				const win = (window as any);

				return win.gamepadIsConnected && win.axesChaged;
			},
			
			check(what) { 
				expect(what).toEqual([.1,.2,.3]);
			},
		},

		//
		// is the phone showing the right slot label to the user?
		//
		{
			async phone(){
				return (window as any).slot.label
			},

			check(what) {
				expect(what).toEqual("Player1");
			},
		}
	]
}));

 