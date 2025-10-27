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
		window.btnClicked = 0;

		const push = new window.BANDI.PushKey({
			id:"push",
			radius:"100px", 
			onClicked:()=>{
				console.log("Push button clicked!!");

				window.btnClicked++;
			}
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
						window.btn = pushBtn;

						resolve();
					} );

				} );
			},  
		},
		
		//
		// remove keys and check if the click was detected
		//
		{
			server: ()=>{

				//
				// remove keys....
				//
				window.slot.setKeys([]); 

				return window.btnClicked;
			}, 
			check: what => expect(what).toEqual(1) 
		},

		//
		// click the button again
		//
		{
			phone: async ()=>{
				//
				// clicking the button on the client side should have no effect...
				//
				window.btn.isPressed = true;
				window.btn.isPressed = false;
			},  
		}, 

		//
		// is the phone showing the right slot label to the user?
		//
		{
			server: ()=>window.btnClicked, 
			check: what => expect(what).toEqual(1) 
		} 
	]
}));

 