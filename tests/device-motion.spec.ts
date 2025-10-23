import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base';

test('Device motion relay test', pingPongTester({
	appSetup: async ()=>{
		const slot = new window.BANDI.Joystick("Player1", false); 

		const relay = new window.BANDI.DeviceMotionRelay({
			id:"gpad",
			radius:"5vw", 
			onMotion(ev) {
				window.motionDetected = true;
			},
		});

		window.motionRelay = relay; 

		relay.motion.on( ev => {
			console.log("Got acceleration event", ev.acceleration)
			window.acceleration = [ev.acceleration?.x,ev.acceleration?.y,ev.acceleration?.z];

			const gacc = ev.accelerationIncludingGravity;
			window.gacc = [gacc?.x, gacc?.y, gacc?.z];
		}); 

		slot.setKeys([ relay ]); 

		return slot.url; 
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
 
			check: what => expect(what).toBe("motion")
		},
 
		//
		// butons
		//
		{
			phone: async ()=> {
				window.dispatchEvent(new DeviceMotionEvent('devicemotion', {
					acceleration: {
						x:1, y:2, z:3
					},
					accelerationIncludingGravity: {
						x:4, y:5, z:6
					}
				}))
			},  
		}, 

		//
		// motion detected
		//
		{
			server: ()=>window.motionDetected , 
			check: what => expect(what).toBe(true)
		}, 

		//
		// acceleration
		//
		{
			server: () => window.acceleration,
			check: what => expect(what).toEqual([1,2,3]) 
		},

		//
		// acceleration with gravity
		//
		{
			server: () => window.gacc,
			check: what => expect(what).toEqual([4,5,6]) 
		},
	]
}));