import { Signal } from "./utils/Signal";  
import { Server } from "./Server";
import { PushKey } from "./key/PushKey";
import { DirKey } from "./key/DirKey";
import type { KeyConfig } from "./layout/KeysLayout";
import { Key } from "./key/Key";
import { CameraStream } from "./key/CameraStream";

let joystickId = 0; 
 

type RemoteKeyConfig = KeyConfig & {
	kid:number
}


export class Joystick extends Server {

	protected currentPeer?:string;
	readonly id = ++joystickId;

	private _label:string;

	/**
	 * The label/name of this slot. To be shown to the user. Eg: "Player 1"
	 */
	get label(){ return this._label; }

	/**
	 * the ID of the other joystick on the other side.
	 */
	protected remoteId = 0;

	/**
	 * The element used to show the QR code and state of the connection on the html to the user.
	 */
	protected _domElement?:HTMLElement;

	protected $connected = new Signal();
	protected $disconnected = new Signal(); 

	protected $keys = new Signal<Key[]>(); 
	private _keys?:Key[]; 

	get connected(){ return this.$connected.asPublic(); }
	get disconnected(){ return this.$disconnected.asPublic(); } 
	get keysChange(){ return this.$keys.asPublic(); } 

	private stopKeySync = new WeakMap<Key, VoidFunction>();
 
	/**
	 * if it is in server mode, this function should be called anytime the keys change.
	 */
	private sendKeys?:VoidFunction;

	private leaveRoom?:VoidFunction;

	/** 
	 * @param isRemote FALSE=your app. TRUE=the phone.
	 * @param label Label shown in the UI above the QR code...
	 */
	constructor( label:string = "", readonly isRemote:boolean = false ){
		super()

		this._label = label;

		//requestAnimationFrame(()=>this.connect());
		this.connect();
	} 
  
	protected _serverPeerId?:string; 

	/** 
	 * This only makes sense to call it if it is a server joystick. 
	 * @returns The url where the phone will go that will display the UI for the controller
	 */
	static urlCode() {
		const params = new URLSearchParams(location.search);
		return params.get('slot');
	}

	/**
	 * The URL to the host that contains the remote joystick and passing in the querystring the slot in which we are.
	 */
	get url()
	{
		if(!this._config)
		{
			throw new Error(`You forgot to set the config `);
		}
		
		return `${ this._config.remoteControlUrl }?slot=${this.serverId}|${this.id}`;
	} 

	protected get otherPeerId() {
		return this.isRemote? this.serverId : this.currentPeer;
	}

	setKeys( newKeys:Key[] )
	{
		if( this._keys )
		{
			this._keys.forEach( key => {

				if( this.stopKeySync.has(key) )
				{
					this.stopKeySync.get(key)!();
					this.stopKeySync.delete(key);
				}
				key.dispose()
			}); 
		}

		this._keys = newKeys; 

		//
		// keep in sync....
		//
		this._keys.forEach( key => {
			if( !this.stopKeySync.has(key) )
			{
				console.log( this._keys, key )
				this.stopKeySync.set( key, key.keepInSync( this.api.room, this.isRemote, ()=>this.otherPeerId ) );
			}
		});

		//
		// since the keys changed, send them to the other side if we are the server...
		//
		if( !this.isRemote )
		{ 
			this.sendKeys?.();
		}

		console.log("Keys set!")
		this.$keys.emit( this._keys );
	}

	/**
	 * Creates the "room" and the hooks
	 */
	private connect( ) {  
		 
		if( this.isRemote )
		{
			const slot = Joystick.urlCode();

			if(!slot)
			{
				throw new Error(`There's no server info in the querystring...`);
			}

			const [serverId, slotId] = slot.split("|");
			this.serverId = serverId; //<-- the peerID of the server app.
			this.remoteId = parseInt( slotId );   
		} 
		else 
		{
			console.log("Im server...")
		}

		const api = this.api;

		const [ requestPlug,onPlugRequest] = api.plug;
		const [ sendPlugResult, onRequestPlugResponse ] = api.plugResponse;  
		const [ sendKeys, onKeys ] = api.room.makeAction<RemoteKeyConfig[]>('keys');
		const [ setLabel, onLabel ] = api.room.makeAction<string>('lbl');
 
		/**
		 * ---------------------------------- P H O N E -----------------------------------
		 */
		if( this.isRemote )
		{ 
			

			const disconnect = ()=>{
				console.log("Disxonnect...")

				this.setKeys([]);

				this.currentPeer = undefined;
				this._label=""; 

				this.api.room.leave().then(()=>this.$disconnected.emit());
				//this.$disconnected.emit(); 
			}

			//
			// check if we are connectd to the server...
			//
			api.room.onPeerJoin( peerId => {

				if( peerId==this.serverId )
				{ 
					// if( !this.currentPeer )
					// {
					// 	this.currentPeer = peerId;
					// 	//this.$connected.emit();
					// }

					console.log("Request plug!", this.remoteId, this.serverId )
					//
					// request to be "plugged" into the socket shown in the url.
					//
					requestPlug( this.remoteId, this.serverId );
				}
			});

			onLabel( (newLabel, peer)=>{
				if( peer==this.serverId )
				{
					this._label = newLabel;
				}
			});

			//
			// the server tells us if we got connected or not...
			//
			onRequestPlugResponse( (success, peerId )=>{
				if( peerId==this.serverId )
				{
					if( success )
					{
						this.currentPeer = peerId;
						this.$connected.emit();
					}
					else 
					{
						disconnect();

						this.currentPeer = undefined;
						this.$disconnected.emit();
 
					}
				}
			});

			//
			// the server has sent us the new keys we should use...
			//
			onKeys( (newKeys, peer) => {
				if( peer==this.serverId ) { 

					this.setKeys( newKeys.map( kconfig=>{

						let key :Key;

						switch( kconfig.type )
						{
							case "button":
								key = new PushKey(kconfig, kconfig.kid);  
								break;

							case "vec2":
								key = new DirKey(kconfig, kconfig.kid); 
								break;

							case "camera":
								key = new CameraStream(kconfig, kconfig.kid); 
								break;
						}  

						return key!;

					}) );

				};
			}); 

			//
			// lose connection with the sever?
			//
			api.room.onPeerLeave( peerId => { 
				if( peerId==this.serverId )
				{
					disconnect(); 
				}
			});

			this.leaveRoom = ()=>disconnect();
		}

		/**
		 * ----------------------------- S E R V E R / W E B ------------------------------
		 */
		else 
		{  
			this.leaveRoom = ()=>{
				throw new Error(`I'm the server...`);
			}

			//
			// quick method to send our keys to the "phone"
			//
			this.sendKeys = ()=>{
				if(!this.currentPeer) {
					console.log("Not connected no anyone...")
					return};

				if( this._keys )
				{
					console.log("Sending the keys...")
					sendKeys( this._keys.map(k=>({ ...k.config, kid:k.kid, visible:k.visible })), this.currentPeer );
				}   
				else {
					console.log("No keys to send..")
				}
			};

			onPlugRequest((slotId, peerId)=>{
 
				console.log("Plug restested", this.id, slotId );

				if( this.id !== slotId ) return; // not for me...

				if( this.currentPeer && this.currentPeer!=peerId )
				{
					// no...
					console.log("Wrong peer")
				}
				else 
				{
					this.currentPeer = peerId;
					// ok...
				} 

				const success = this.currentPeer == peerId;

				console.log("Send plug result, which is", success)
				sendPlugResult( success, peerId ).then(()=>{

					if( success )
					{  
						console.log(`Plugged to ${peerId} successfully`)
						this.$connected.emit();

						setLabel( this._label,  peerId );

						//
						// as soon as the peer connects, send the keys...
						//
						console.log("Send the keys to peer...")
						this.sendKeys!();
					} 
					else 
						console.warn(`Peer ${peerId} tried to connect to slot but it is already taken by ${this.currentPeer}`)

					}
				);   
				
			}); 

			api.room.onPeerLeave( peerId => { 
				if( peerId==this.currentPeer )
				{
					console.log("Joystick disconnected")
					this.currentPeer = undefined;
					this.$disconnected.emit();
				}
			}); 
		}  

	} 

	disconnect() { 
		console.log("Disconnect called...") 
		this.leaveRoom?.();
	}

	async domElement() {

		if( this._domElement ) return this._domElement;

		let mod;

		try {
		  mod = await import('qrcode')
		} catch {
			throw new Error("Failed to load the qrcode module. Get it from: https://www.npmjs.com/package/qrcode")
		}

		if (mod) {

			const canvas = await mod.default.toCanvas( this.url );
			const div = document.createElement("div");
			const label = document.createElement("div");

			label.innerText = this.label;
			label.style.color = "white";
			label.style.backgroundColor = "black";
			label.style.textAlign = "center";


			div.appendChild( label );
			div.appendChild( canvas );

			this.$connected.on( ()=>div.style.display="none" );
			this.$disconnected.on( ()=>div.style.display="" );

			this._domElement = div;
			console.log(`Input ${ this.label } = ${this.url }`)

			return div;
		}
	}
}