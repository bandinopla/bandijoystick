import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base'; 

//
// check if the client connects to the server and key presses are propagated
//
test('Basic interaction', pingPongTester({
	appSetup: async ()=>{

		const slot = new window.BANDI.Joystick("Player1", false);

		window.slot = slot;

		const push = new window.BANDI.PushKey({
			id:"push",
			radius:"100px", 
			onClicked:()=>{
				console.log("Push button clicked!!");

				window.btnClicked = true;
			}
		}); 

		slot.connected.on(()=>{
			window.connectedEvent = true;
		});
		
		slot.connected.off(()=>{
			console.log("Peer disconnected, bye!")
			window.disconnectedEvent = true;
		}); 

		slot.setKeys([ push ]); 

		return slot.url; 
	}, 

	tests: [

		//
		// click some keys
		//
		{
			async phone() { 
				
				const slot = new window.BANDI.Joystick("", true); 

				window.slot = slot; 
				
				return new Promise<void>( resolve => {

					slot.keysChange.on( keys=>{  

						const pushBtn = keys[0] as BANDI.PushKey;

						pushBtn.isPressed = true; 
						pushBtn.isPressed = false; 

						resolve();
					} );

				} );
			},  
		},
		
		//
		// was the gamepad relay detected??
		//
		{
			server: ()=>window.connectedEvent, 
			check: what => expect(what).toBe(true) 
		},

		//
		// was the button press detected?
		//
		{
			server: ()=>window.btnClicked, 
			check: what => expect(what).toBe(true) 
		}, 

		//
		// is the phone showing the right slot label to the user?
		//
		{
			server: ()=>window.slot.label, 
			check: what => expect(what).toBe("Player1") 
		} 
	]
}));

 