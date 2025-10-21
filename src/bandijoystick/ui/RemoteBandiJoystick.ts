import * as BANDI from "bandijoystick"; 
//import { PushKey } from "../key/PushKey";
//import { DirKey } from "../key/DirKey";
//import { CameraStream } from "../key/CameraStream";

import { Button } from "./Button";
import { Stick } from "./Stick";

import { CameraStreamDisplay } from "./CameraStreamDisplay";
import feather, { type FeatherIconNames } from "feather-icons"; 
 
 
/**
 * This class is the "phone joystick" the UI on the phone's side.
 */
export class RemoteBandiJoystick extends BANDI.Joystick {
	constructor(){
		super("", true);


		const label = document.createElement("div");
		label.classList.add("joystick-label");
		document.body.appendChild(label);

		const remove : VoidFunction[] = []; 

		//
		// BUttonType map to the function that creates the UI for it...
		//
		const factory: Record<BANDI.ButtonType, ( host:HTMLDivElement, key:BANDI.Key )=>VoidFunction > = {
			"button": this.createButton,
			"vec2": this.createDirectonalStickButton, 
			"camera": this.createCameraStreamButton,
			"gpad-relay": this.createGamepadRelayButton
		}

		//
		// create the keys... (the app sent us the keys to be used/displayed)
		//
		this.keysChange.on( newKeys => {

			console.log("NEW LAYOUT !")
			label.style.display="";
			label.innerText = this.label;

			//
			// remove old ui
			//
			if( remove.length ) remove.forEach( remove=>remove() );
			remove.length = 0;

			//
			// build new ui
			//
			newKeys.forEach( key => {

				const div = document.createElement("div"); 
						div.style.width = key.config.radius;
						div.style.height = key.config.radius;
						div.style.borderRadius = "100%"
						div.style.position = "absolute";  
						div.style.left = `calc( ${ key.config.x ?? "0px" } - ${key.config.radius} / 2 )`;
						div.style.top = `calc( ${ key.config.y ?? "0px" } - ${key.config.radius} / 2 )`;
						

				const keyCleanupFn = factory[key.config.type]?.(div, key);

				if( keyCleanupFn )
				{
					remove.push(keyCleanupFn);
					document.body.appendChild( div );  
				}
				else 
				{
					console.warn(`No idea what button type "${key.config.type}" should be...`);
					return;
				}  

				//
				// Common UI stuff for any button...
				//

				const onVisibilityChange = (show:boolean)=>{
					div.style.display = show? "grid" : "none";
				}

				key.visibilityChanged.on(onVisibilityChange); 

				onVisibilityChange( key.visible );
 

				key.onError.on(this.onKeyError);

				remove.push( ()=>{
					key.onError.off(this.onKeyError);
					key.visibilityChanged.off(onVisibilityChange); 
					div.remove()
				} );

			});


		}); 


		//
		// Rest of the UI for the virtual joystick....
		//
		const closeBtn = new Button("power"); 
		const closeBtnDiv = document.createElement("div");

		closeBtn.setColor("#ff0000");

		closeBtnDiv.classList.add("close-btn");
		closeBtnDiv.appendChild( closeBtn.dom );

		document.body.appendChild(closeBtnDiv);

		closeBtn.onPressed = isDown => {
			if( isDown )
			{
				closeBtnDiv.remove();
				this.disconnect();
			}
		}

		//
		// show the "disconnect" button
		//
		this.disconnected.on(()=>{
			if( remove.length ) remove.forEach( remove=>remove() );
			remove.length = 0;
			label.style.display="none";
		}); 
	}

	private createButton( host:HTMLDivElement, key:BANDI.PushKey )
	{
		const btn = new Button( key.config.iconClass );

		host.appendChild( btn.dom );
		
		btn.onPressed = isDown => key.isPressed=isDown;

		if( key.config.background )
		{
			btn.setColor( key.config.background );
		}

		return ()=>{
			btn.dispose()
		}
	}

	private createDirectonalStickButton( host:HTMLDivElement, key:BANDI.DirKey ) {
			const stick = new Stick(host);

			stick.onMove = (x, y)=>{
				key.x = x;
				key.y = y;
			}

			if( key.config.background )
			{
				stick.setColor( key.config.background );
			}

			return ()=>stick.dispose()
	}

	private createCameraStreamButton( host:HTMLDivElement, key:BANDI.CameraStream ) {
		const camBtn = new CameraStreamDisplay();

		camBtn.getCameraStream = key.startCameraStream.bind(key);

		host.appendChild( camBtn.dom ); 
		 
		const onStream = (stream:MediaStream|undefined) => {
			if(!stream)
			{
				console.log("Reset hoystick camera")
				camBtn.reset();
			}
		}

		key.onStream.on(onStream)

		return ()=>{ 
			camBtn.dispose();
			key.onStream.off(onStream)
		};
	}

	private createGamepadRelayButton( host:HTMLDivElement, key:BANDI.GamepadRelay ) {
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

	private onKeyError = (error:string) => {
		const div = document.createElement("div"); 
			div.style.width = "100vw";
			div.style.height = "100vh"; 
			div.style.position = "absolute"; 
			div.style.zIndex = "999";  
			div.style.backgroundColor = "#E1341E"
			div.style.color = "white";
			div.style.display="flex";
			div.style.justifyContent="center";
			div.style.placeItems="center";
			div.style.fontSize="3vw";
			div.innerHTML = feather.icons["alert-octagon"].toSvg() + "&nbsp;&nbsp;"+error;
			document.body.appendChild( div );  
			div.addEventListener("touchstart", ()=>{
				div.remove()
			})
	}
}