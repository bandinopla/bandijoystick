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
		// create the keys...
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
						document.body.appendChild( div );  


				if( key instanceof BANDI.PushKey )
				{
					//div.addEventListener("touchstart", ()=> key.isPressed=true );
					//div.addEventListener("touchend", ()=> key.isPressed=false ); 
					//div.innerHTML = feather.icons.airplay.toSvg();
					const btn = new Button( key.config.iconClass );
					div.appendChild( btn.dom );
					remove.push(()=>btn.dispose());
					btn.onPressed = isDown => key.isPressed=isDown;

					if( key.config.background )
					{
						btn.setColor( key.config.background );
					}
				}

				else if( key instanceof BANDI.DirKey )
				{ 
					const stick = new Stick(div);

					stick.onMove = (x, y)=>{
						key.x = x;
						key.y = y;
					}

					if( key.config.background )
					{
						stick.setColor( key.config.background );
					}

					remove.push(()=>stick.dispose());
				}

				else if( key instanceof BANDI.CameraStream )
				{
					const camBtn = new CameraStreamDisplay();

					camBtn.getCameraStream = key.startCameraStream.bind(key);

					div.appendChild( camBtn.dom ); 
					 
					const onStream = (stream:MediaStream|undefined) => {
						if(!stream)
						{
							console.log("Reset hoystick camera")
							camBtn.reset();
						}
					}

					key.onStream.on(onStream)

					remove.push(()=>{ 
						camBtn.dispose();
						key.onStream.off(onStream)
					});
				}

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