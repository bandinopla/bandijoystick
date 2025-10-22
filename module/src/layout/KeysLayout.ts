
 
export type ButtonType = "vec2" | "button" | "camera" | "gpad-relay";

type CSSLength = `${number}px` | `${number}%` | `${number}vh` | `${number}vw`;

export type KeyConfig = {
	type:ButtonType

	/**
	 * @see https://feathericons.com/
	 */
	iconClass?: string

	id:string

	x?:CSSLength
	y?:CSSLength

	/**
	 * background color of the button
	 */
	background?:string; 
	textColor?:string;
	
	radius:string
	visible?:boolean
} 

export type RemoteKeyConfig = KeyConfig & {
	kid:number
}
 

export type KeysLayout = {
	keys: KeyConfig[]
	id: string
}