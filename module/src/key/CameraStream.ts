import type { Room } from "trystero";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { Key } from "./Key";

// // get a local audio stream from the microphone
// const selfStream = await navigator.mediaDevices.getUserMedia({
//   audio: true,
//   video: false
// })

export class CameraStream extends Key {

	private $cameraStream:Signal<MediaStream|undefined> = new Signal();
	private $streamRemoved:Signal<MediaStream> = new Signal();

	private _stream:MediaStream|undefined; 
	private iOwnTheStream = false;
	
	private get stream(){ return this._stream; }
	private set stream( stream:MediaStream|undefined ) {
		
		const oldStream = this._stream;

		const changed = this._stream!==stream;

		this._stream = stream;

		if( changed && oldStream ) this.$streamRemoved.emit(oldStream);
		if( changed ) this.$cameraStream.emit(stream);
	}
	
	get onStream() {
		return this.$cameraStream.asPublic();
	}

	private stopPeersToo?:VoidFunction;

	constructor( config:Omit<KeyConfig, "type">, kid?:number )
	{
		super({
			...config, type:"camera"
		}, kid);
	} 

	/**
	 * Call this method to start the camera feed on the current machine
	 * @returns 
	 */
	async startCameraStream() {

		let stream : MediaStream|undefined;

		try
		{
			stream = await navigator.mediaDevices.getUserMedia({ video: true, audio:true });
			this.iOwnTheStream = true;
		}
		catch(err)
		{ 

			this.$onError.emit("You blocked the camera access :(")
			throw err;
		}
		 
		this.stream = stream;   

		return stream;
	}

	/**
	 * Will stop the stream on all sides. here and on the peer.
	 */
	stopCameraStream() {

		//console.log("STOP CAMERA")
		this.stream = undefined; 
		this.stopPeersToo?.();
	}

	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void
	{ 
		let unsynced = false;
		const superSync = super.keepInSync(room, isRemote, getPeerId);
		const [stopStream, onShouldStopTheStream ] = this.makeRoomAction<null>(room, "stop");

		onShouldStopTheStream((_, peer)=>{
			if( unsynced ) return;
			if( peer==getPeerId() )
			{
				//console.log("onShouldStopTheStream...")
				this.stream = undefined;
			}
		});

		const onStreamSet = ( stream:MediaStream|undefined ) => {
			if(!stream) return;

			if( this.iOwnTheStream ) // notify peers...
			{
				//console.log("SEND MY STREAM TO THE PEER...")
				room.addStream( stream, getPeerId() ); 
			} 
		}

		const onStreamRemoved = ( stream:MediaStream ) => {
 
			//console.log("Stopping all trakcs in my stream")
			stream.getTracks().forEach( track=>track.stop());  

			//console.log("remove stram from room")
			room.removeStream( stream, getPeerId() ); 
		}

		this.stopPeersToo = ()=>{
			stopStream(null, getPeerId());
		}

		room.onPeerStream( (stream, peer)=>{
			if( unsynced ) return;
			if( peer==getPeerId() )
			{
				
				if( !stream.active )
				{
					return;
				}

				//console.log("Got a peer stream", stream)
				this.iOwnTheStream = false;
				this.stream = stream;
			}
		});

		this.onStream.on(onStreamSet);
		this.$streamRemoved.on(onStreamRemoved); 

		return ()=>{

			superSync();
			unsynced = true;
			this.stopPeersToo = undefined;
			this.onStream.off(onStreamSet);
			this.$streamRemoved.off(onStreamRemoved);  
		}
	}
	
}