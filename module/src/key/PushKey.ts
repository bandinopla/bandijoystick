import type { Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { CLEAR, keepInSync, Key } from "./Key";


export type PushKeyConfig = {
	onClicked?:VoidFunction
}

export class PushKey extends Key {
	protected $pressChange= new Signal<boolean>();
	protected $clicked= new Signal<void>();
	protected _isPressed = false; 

	constructor( config:Omit<KeyConfig, "type"> & PushKeyConfig, kid?:number )
	{
		super({
			type:"button",
			...config
		}, kid);
 
		if( config.onClicked )
		{
			this.$clicked.on(config.onClicked);
		}
	}

	get clicked() {
		return this.$clicked.asPublic();
	}

	get pressed(){
		return this.$pressChange.asPublic()
	}

	get isPressed() {
		return this._isPressed;
	}

	set isPressed( down:boolean )
	{
		const changed = down !== this._isPressed;
		this._isPressed = down;
		if( changed ) this.$pressChange.emit(this._isPressed);
		if( !down && changed )
		{
			this.$clicked.emit();	
		}
	}

	//---------------------
	override [keepInSync](room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super[keepInSync](room, isRemote, getPeerId);
		const [ sendPressed, onPressedChange ] = this.makeRoomAction<boolean>(room, 'p'); 
	 

		if( isRemote ) // phone
		{  
			const onPressed = (isPressed:boolean) => {
				
				const peer = getPeerId();
				if( peer )
				{
					console.log("send pressed to per: ", isPressed, peer)
					sendPressed(isPressed, peer);
				}
				else {
					console.log("Pressed changed but i have no peer connected")
				}
			};

			this.pressed.on( onPressed );

			return ()=>{
				superRemove();
				this.pressed.off( onPressed );
			};
		}
		else 
		{ 

			onPressedChange( (isDown, other)=>{
				 
				if( other==getPeerId() )
				{
					console.log("peer send us on pressed: ", isDown)
					this.isPressed = isDown;
				}
			});

			return ()=>{
				superRemove();
				onPressedChange(CLEAR);
			}
		} 
		
	}
} 