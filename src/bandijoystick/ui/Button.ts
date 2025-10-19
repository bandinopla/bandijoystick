import styles from "./Button.module.css"
import feather, { type FeatherIconNames } from "feather-icons";

export class Button {
	readonly dom:HTMLDivElement;
	
	onPressed?:( isDown:boolean )=>void;

	readonly dispose:VoidFunction; 
	readonly setColor: ( color:string )=>void;

	constructor( icon?:string ) {
		const div = document.createElement("div");
		div.classList.add( styles.btn )
		
		if( icon )
		{
			const ico =  feather.icons[ icon as keyof typeof feather.icons ];
 
			div.innerHTML = ico? ico.toSvg() : "?";
		}

		const onPressed = (ev:TouchEvent) => this.onPressed?.(true);
		const onReleased = (ev:TouchEvent) => this.onPressed?.(false);

		div.addEventListener("touchstart", onPressed);
		div.addEventListener("touchend", onReleased);
		//todo: unregister events

		this.setColor = cssColor => { 
			 
			div.style.background = cssColor; 
		}

		this.dom = div;

		this.dispose = ()=>{
			div.removeEventListener("touchstart", onPressed);
			div.removeEventListener("touchend", onReleased);
			div.remove()
		}
	}


}