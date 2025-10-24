import { test, expect } from '@playwright/test';
import * as BANDI from "../module/src/module";
import { pingPongTester } from './base';

test('Image key', pingPongTester({
	appSetup: async ()=>{
		const slot = new window.BANDI.Joystick("Player1", false); 

		const img = new window.BANDI.Image({
			id:"foo",
			radius:"100px",
			backgroundSize:"10%",
			src:"../public/logo.webp",
			onClicked: ()=>{
				window.imageClicked = true;
			}
		});  

		img.pressed.on( isPressed=> {
			if( isPressed )
			{
				window.wasPressed = true;
			}
			else 
			{
				window.wasReleased = true;
			}
		})
		
		window.imgKey = img;

		slot.setKeys([ img ]); 

		return slot.url; 
	}, 

	tests: [
		{
			async phone() { 
				
				const slot = new window.BANDI.Joystick("", true);   
				
				return new Promise<string>( resolve => {

					slot.keysChange.on( keys =>{ 

						console.log("KEY GOT!", keys[0].config.id)
 
						const imgKey = keys[0] as BANDI.Image
						window.imgKey = imgKey;

						imgKey.image.on( blob => {

							console.log("Setting blob!", blob)
							window.imageBlob = blob;
						});

						resolve( keys![0].config.type )

					} );

				} );
			},  
 
			check: what => expect(what).toBe("image")
		},

		//
		// press image
		//
		{
			phone: async()=>new Promise(resolve => {
				window.imgKey.isPressed = true;
				setTimeout(()=>{
					window.imgKey.isPressed = false;
					setTimeout( resolve, 200 )
				}, 300)
			})
		},

		//
		// did the server detected the click?
		//
		{
			server: ()=>window.wasPressed && window.wasReleased && window.imageClicked,
			check: what => expect(what).toBe(true)
		},
 
		//
		// src ok?
		//
		{
			phone: async ()=> window.imgKey.src,  
			check: what => expect(what).toEqual("../public/logo.webp")
		}, 

		//
		// got blob?
		//
		{
			phone: async ()=> new Promise<void>( resolve=>{

				let loop = ()=>{
					if( window.imgKey.imageBlob )
					{
						resolve();
						return;
					}
					requestAnimationFrame(loop)
				}
				loop()

			}),  
			check: what => expect(what).not.toBeNull()
		}, 

		//
		// unset the image
		//
		{
			server: async ()=> window.imgKey.src = undefined
		},

		//
		// src got cleared
		//
		{
			phone: async ()=> window.imgKey.src,  
			check: what => expect(what).toBeUndefined()
		}, 

		//
		// blob got cleared
		//
		{
			phone: async ()=> window.imgKey.imageBlob,  
			check: what => expect(what).toBeUndefined()
		}, 

		//
		// bg size
		//
		{
			phone: async ()=> window.imgKey.backgroundSize,  
			check: what => expect(what).toEqual("10%")
		}, 
		
 
	]
}));