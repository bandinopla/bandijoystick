import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base';

test('Gamepad Relay test', pingPongTester({
	appSetup: async ()=>{
		const slot = new window.BANDI.Joystick("Player1", false); 

		const gamepad = new window.BANDI.GamepadRelay({
			id:"gpad",
			radius:"5vw",
			gamepadIndex: 0,
			onInput: ()=>{
				window.inputDetected = true
			}
		});

		window.gamepadRelay = gamepad;
 
		gamepad.buttonsChanged.on( buttons => {
			window.buttonsOk = buttons![0].pressed && !buttons![1].pressed;
		});

		gamepad.axesChanged.on( axes => {
			window.axesOk = axes!.every((v,i)=>v==(i+1)/10)
		});


		slot.setKeys([ gamepad ]); 

		return slot.url; 
	},

	phoneInitScript: ()=>{  
		  window.navigator.getGamepads = () => [{
				 id: "FakePad",
			      index: 0,
			      connected: true,
			      mapping: "standard",
			      buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: i%2==0, touched:true, value: i/100 })) as readonly GamepadButton[],
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
		{
			async phone() { 
				
				const slot = new window.BANDI.Joystick("", true);   
				
				return new Promise<string>( resolve => {

					slot.keysChange.on( keys =>{ 
 

						resolve( keys![0].config.type )

					} );

				} );
			},  
 
			check: what => expect(what).toBe("gpad-relay")
		},
 
		//
		// butons
		//
		{
			server: ()=>window.buttonsOk , 
			check: what => expect(what).toBe(true)
		}, 

		//
		// axes
		//
		{
			server: ()=>window.axesOk , 
			check: what => expect(what).toBe(true)
		}, 

		//
		// mapping
		//
		{
			server: () => window.gamepadRelay.mapping,
			check: what => expect(what).toBe("standard") 
		},
	]
}));