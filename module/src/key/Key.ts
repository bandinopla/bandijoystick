 
import type { DataPayload, Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";

let keyId = 0;
 
export class Key {
	readonly kid ; 

	protected $onError:Signal<string> = new Signal();

	private _visible = true;
	protected $visibilityChanged = new Signal<boolean>();

	get visible(){ return this._visible; }
	set visible( b:boolean )
	{
		const changed = this._visible!=b;
		this._visible = b;
		if( changed ) this.$visibilityChanged.emit(b);
	}

	get visibilityChanged(){ return this.$visibilityChanged.asPublic() }
	get onError(){ return this.$onError.asPublic() }

	/**
	 * Send the current state to the "other side" in case we hold some state...
	 * This is meant to be used by the key when being run on the "app" side and **defined in the `keepInSync` method**
	 */
	protected syncState?:VoidFunction;

	constructor( readonly config:KeyConfig, kid?:number )
	{
		this.kid = kid ?? ++keyId;  
		this.visible = config.visible ?? true;
	} 

	/** 
	 * The idea here is to create the actions in the room needed to keep his Key object in sync with the other one.
	 * And should return a function to cleanup any listener created that will be called when the key is removed.
	 * 
	 * **Call super.keepInSync** if you override, because here I check for the visibility property.
	 * 
	 * @param room 
	 * @param isRemote TRUE=we are a phone. FALSE=we are a webapp
	 * @param getPeerId get the peerId from which we are recieving or sending data
	 * @returns 
	 */
	keepInSync( room:Room, isRemote:boolean, getPeerId:()=>string|undefined ) {

		const [ setVisibility, onVisibility ] = this.makeRoomAction<boolean>(room, 'v'); 

		if( isRemote )
		{
			let removed = false;

			onVisibility( (shouldBeVisible, other)=>{
				if( removed ) return;
				if( other==getPeerId() )
				{
					this.visible = shouldBeVisible;
				}
			});

			return ()=>{removed=true} 

		}
		else 
		{
			const onVisibility = (isVisible:boolean) => {
				
				const peer = getPeerId();
				if( peer )
				{
					setVisibility(isVisible, peer);
				}
			};

			this.visibilityChanged.on( onVisibility );

			return ()=>this.visibilityChanged.off( onVisibility );
		}
 
	}

	protected makeRoomAction<T extends DataPayload>(room:Room, prefix:string ) {
		return room.makeAction<T>('k'+this.kid+prefix)
	}

	dispose() {
		
	}
 
}  