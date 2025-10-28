 
import type { DataPayload, Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import type { ActionSender, JsonValue } from "trystero";

let keyId = 0;

export const keepInSync = Symbol("keepInSync");

/**
 * Pass this as listener value to indicate you want to clear the listener.
 * Internally the listener will be set to `()=>{}`
 */
export const CLEAR = Symbol('CLEAR');
 
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
	[keepInSync]( room:Room, isRemote:boolean, getPeerId:()=>string|undefined ) {

		const [ setVisibility, onVisibility ] = this.makeRoomAction<boolean>(room, 'v'); 

		if( isRemote )
		{

			onVisibility( (shouldBeVisible, other)=>{
				
				if( other==getPeerId() )
				{
					this.visible = shouldBeVisible;
				}
			});

			return ()=>{ 
				onVisibility(CLEAR);
			} 

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

	/**
	 * 
	 * @param room the room in which to create the action
	 * @param prefix short ID to identify this action
	 * @returns a tuple [ set, onValue( listner | undefined ) ] and if you pass `undefined` to onValue, then you unregister from events.
	 */
	protected makeRoomAction<T extends DataPayload>(room:Room, prefix:string ) : [ActionSender<T>, (callback:((data: T, peerId: string, metadata?: JsonValue) => void)|typeof CLEAR)=>void] {
		const [setter, getter] = room.makeAction<T>('k'+this.kid+prefix);

		return [
			setter,
			( callback )=>{
				if( callback==CLEAR )
				{
					console.log("Removing key action", 'k'+this.kid+prefix)
					getter(()=>{});
				}
				else 
				{
					getter(callback);
				}
			}
		]
	}

	dispose() {
		
	}
 
}  