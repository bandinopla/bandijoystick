import type { Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { Key } from "./Key";


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
	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super.keepInSync(room, isRemote, getPeerId);
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
			let removed = false;

			onClicked( (_, other)=>{
				if( removed ) return;
				if( other==getPeerId() )
				{
					this.click();
				}
			});

			return ()=>{
				superRemove();
				removed=true;
			}
		} 
		
	}
} 