import * as BANDI from "bandijoystick";   
import feather, { type FeatherIconNames } from "feather-icons"; 
import { createKeyUI } from "./key/factory";
import { Button } from "./key/Button";
 
 
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
		// create the keys... (the app sent us the keys to be used/displayed)
		//
		this.keysChange.on( newKeys => {
 
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
						div.id = key.config.id;

				const keyCleanupFn = createKeyUI(key, div);

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