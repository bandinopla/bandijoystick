import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base';

test('Gamepad Relay test', pingPongTester({
	appSetup: async ()=>{
		const slot = new window.BANDI.Joystick("Player1", false);


		const gamepad = new window.BANDI.GamepadRelay({
			id:"gpad",
			radius:"5vw",
			gamepadIndex: 0
		});

		(window as any).gpad = gamepad;


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

				(window as any).slot = slot;

				slot.connected.on(()=>console.log("Connected to app!"));  
				
				return new Promise<void>( resolve => {

					slot.keysChange.on( _=>{ 
 

						resolve()

					} );

				} );
			},  
		},
 
		//
		// axes
		//
		{
			async server() {
				return (window as any).gpad.axes;
			},
			
			check(what) { 
				expect(what).toEqual([.1,.2,.3]);
			},
		},

		//
		// buttons
		//
		{
			async server() {
				return (window as any).gpad.buttons.flatMap((btn : GamepadButton)=>btn.pressed);
			},
			
			check(what) { 
				expect(what.slice(0,4)).toEqual([true,false,true,false]);
			},
		},

		//
		// mapping
		//
		{
			async server() {
				return (window as any).gpad.mapping;
			},
			
			check(what) { 
				expect(what).toEqual( "standard");
			},
		},
	]
}));