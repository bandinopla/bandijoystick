import type { Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { CLEAR, keepInSync, Key } from "./Key";


type CustomCLASSKeyConfig = {
	onClicked?:VoidFunction
}

export class CLASSKey extends Key { 
	protected $clicked= new Signal<void>(); 

	constructor( config:Omit<KeyConfig, "type"> & CustomCLASSKeyConfig, kid?:number )
	{
		super({
			...config, type:"button"
		}, kid); 
	}

	get clicked() {
		return this.$clicked.asPublic();
	} 

	click() {
		this.$clicked.emit();
	}

	//---------------------
	override [keepInSync](room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super[keepInSync](room, isRemote, getPeerId);
		const [ sendClick, onClicked ] = this.makeRoomAction<{}>(room, 'p'); 
	 

		if( isRemote ) // phone
		{  
			const onClicked = () => {
				
				const peer = getPeerId();
				if( peer )
				{ 
					sendClick({},peer);
				}
			};

			this.clicked.on( onClicked );

			return ()=>{
				superRemove();
				this.clicked.off( onClicked );
			};
		}
		else 
		{ 

			onClicked( (_, other)=>{ 
				if( other==getPeerId() )
				{
					this.click();
				}
			});

			//
			// this one is optional...
			//
			this.syncState = ()=>{ 
				//
				// let's say the button has state in the app, like you app sets some values and such...
				// this is the place to send the state to the remote key so it is up to date...
				// 
			}

			return ()=>{
				superRemove();
				onClicked(CLEAR);
			}
		} 
		
	}
} 