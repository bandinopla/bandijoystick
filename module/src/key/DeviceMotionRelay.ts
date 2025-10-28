import type { Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { CLEAR, keepInSync, Key } from "./Key";


type CustomDeviceMotionRelayConfig = {
	onMotion?:(ev:DeviceMotionEvent)=>void
}

type Num = number | null;

type SerializedDeviceMotion = {
	acc:[x:Num, y:Num, z:Num]|null,
	accg: [x:Num, y:Num, z:Num]|null,
	int: number,
	rotr: [a:Num, b:Num, g:Num]|null,
}


export class DeviceMotionRelay extends Key { 
	private _init = false;
	protected $motion = new Signal<DeviceMotionEvent>(); 
	private _lastKnownMotion? : DeviceMotionEvent;
	private _onMotionHook?:(ev:DeviceMotionEvent)=>void;

	constructor( config:Omit<KeyConfig, "type"> & CustomDeviceMotionRelayConfig, kid?:number )
	{
		super({
			visible:false,
			...config, type:"motion"
		}, kid); 

		this._onMotionHook = config.onMotion;
	}

	private initialize() {
		this._init = true;
		window.addEventListener("devicemotion", this.deviceMotionListener );
	}

	private deviceMotionListener = ( ev:DeviceMotionEvent ) => {
		this._lastKnownMotion = ev;

		this._onMotionHook?.(ev);
		this.$motion.emit(ev);
	}

	/**
	 * Listen for `DeviceMotionEvent`s
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event
	 */
	get motion() {
		return this.$motion.asPublic();
	}  

	/**
	 * Returns the result of the last motion event...
	 */
	get lastKnownMotion() {
		return this._lastKnownMotion;
	}

	private packMotionEvent( e:DeviceMotionEvent ) {
	  const acc : SerializedDeviceMotion["acc"] = e.acceleration
	    ? [e.acceleration.x ?? null, e.acceleration.y ?? null, e.acceleration.z ?? null]
	    : null
	  const accg : SerializedDeviceMotion["accg"]  = e.accelerationIncludingGravity
	    ? [e.accelerationIncludingGravity.x ?? null, e.accelerationIncludingGravity.y ?? null, e.accelerationIncludingGravity.z ?? null]
	    : null
	  const rotr : SerializedDeviceMotion["rotr"]  = e.rotationRate
	    ? [e.rotationRate.alpha ?? null, e.rotationRate.beta ?? null, e.rotationRate.gamma ?? null]
	    : null
	  return { acc, accg, int: e.interval, rotr } as SerializedDeviceMotion
	}

	private unpackDeviceMotion(data: SerializedDeviceMotion): DeviceMotionEvent {
	  return new DeviceMotionEvent("devicemotion", {
	    acceleration: data.acc ? { x: data.acc[0], y: data.acc[1], z: data.acc[2] } : undefined,
	    accelerationIncludingGravity: data.accg ? { x: data.accg[0], y: data.accg[1], z: data.accg[2] } : undefined,
	    rotationRate: data.rotr ? { alpha: data.rotr[0], beta: data.rotr[1], gamma: data.rotr[2] } : undefined,
	    interval: data.int
	  })
	}

	//---------------------
	override [keepInSync](room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super[keepInSync](room, isRemote, getPeerId);
		const [ sendMotion, onMotion ] = this.makeRoomAction<SerializedDeviceMotion>(room, 'motion'); 
	 

		if( isRemote ) // phone
		{  
			if( !this._init )
			{
				this.initialize();
			}

			const onMotion = (motion:DeviceMotionEvent) => {
				
				const peer = getPeerId();
				if( peer )
				{ 
					sendMotion(this.packMotionEvent(motion),peer);
				}
			};

			this.motion.on( onMotion );

			return ()=>{
				superRemove();
				this.motion.off( onMotion );
			};
		}
		else 
		{ 

			onMotion( ( motion, other)=>{
				 
				if( other==getPeerId() )
				{
					this.deviceMotionListener( this.unpackDeviceMotion(motion) );
				}
			});

			return ()=>{
				superRemove();
				onMotion(CLEAR);
			}
		} 
		
	}

	override dispose(): void {
		super.dispose()
		window.removeEventListener("devicemotion", this.deviceMotionListener);
	}
} 