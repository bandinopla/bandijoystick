import type { Room } from "trystero/firebase";
import { Signal } from "../utils/Signal"; 
import { CLEAR, Key } from "./Key";
import type { KeyConfig } from "../layout/KeysLayout";


type Dir = [x:number, y:number];

export class DirKey extends Key {
	protected $dirChange = new Signal<Dir>();
	protected _dx = 0;
	protected _dy = 0;
	private pending = false; 

	constructor( config:Omit<KeyConfig, "type">, kid?:number )
	{
		super({
			...config, type:"vec2"
		}, kid);
	}

	protected scheduleEmit() {
		if (this.pending) return;
		this.pending = true;
		queueMicrotask(() => {
			this.pending = false;
			this.$dirChange.emit([this._dx, this._dy]);
		});
	}

	get changed() {
		return this.$dirChange.asPublic()
	}

	get x() { return this._dx; }
	get y() { return this._dy; }

	set x(b: number) {
		const changed = this._dx != b;
		this._dx = b;
		if (changed) this.scheduleEmit();
	}

	set y(b: number) {
		const changed = this._dy != b;
		this._dy = b;
		if (changed) this.scheduleEmit(); 
	}

	//-----------------------------------------
	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super.keepInSync(room, isRemote, getPeerId);

		const [sendState, onState] = this.makeRoomAction<Dir>(room, 'd');  

		if( isRemote )
		{
			const onDir = (_:Dir)=>{
				const peer = getPeerId();
				if( peer )
				{
					sendState([this.x, this.y], peer);
				} 
			}

			this.changed.on(onDir);

			return ()=>{
				superRemove()
				this.changed.off(onDir);
			}
		}
		else 
		{ 

			onState( (newDir, peer)=>{ 
				if( peer==getPeerId() )
				{
					this.x = newDir[0];
					this.y = newDir[1];
				}
			})

			return ()=>{
				superRemove();
				onState(CLEAR);
			}
		} 
		
	}
} 