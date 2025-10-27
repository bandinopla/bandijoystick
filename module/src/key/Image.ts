import type { Room } from "trystero/firebase";
import type { KeyConfig } from "../layout/KeysLayout";
import { Signal } from "../utils/Signal";
import { PushKey, type PushKeyConfig } from "./PushKey";
import { CLEAR } from "./Key";


type CustomImageConfig = {
	src?:string

	/**
	 * @default "cover"
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
	 */
	backgroundSize?:string;
} & PushKeyConfig;

const $cache:Map<string, Promise<Blob>> = new Map(); 
 

export class Image extends PushKey { 
	protected $image= new Signal<Blob|undefined>(); 
	protected $bgSizeChange = new Signal<string>(); 
	get image(){ return this.$image.asPublic() }

	private _src:string|undefined; 
	private _blob:Blob|undefined;
	private _backgroundSize:string;
	
	get backgroundSizeChange(){
		return this.$bgSizeChange.asPublic()
	}

	/**
	 * @default "cover"
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
	 */
	get backgroundSize(){
		return this._backgroundSize;
	}

	set backgroundSize( newSize:string ) {
		const changed = this._backgroundSize!=newSize;
		this._backgroundSize = newSize;
		if( changed ) this.$bgSizeChange.emit(newSize);
	}

	get imageBlob(){ return this._blob; }  

	private onSrcSet?: (src?:string)=>void;

	constructor( config:Omit<KeyConfig, "type"> & CustomImageConfig, kid?:number )
	{
		super({
			...config,
			//@ts-ignore
			type:"image"
		}, kid); 

		this._backgroundSize = config.backgroundSize ?? "cover";

		if( config.src )
		{
			this.src = config.src;
		}

		console.log(`Src in the config = ${config.src}`)
		
	}

	/**
	 * the src of the image to be loaded
	 */
	get src() {
		return this._src;
	} 

	set src( imgSrc:string|undefined )
	{
		this._src = imgSrc;
		this.onSrcSet?.(imgSrc);
	}

	private async loadBlob( src:string )
	{
		console.log("Load blob for "+src)
		let blob:Blob|undefined;

		try
		{ 
			if( !$cache.has(src) )
			{
				$cache.set(src, fetch(src).then( res=>res.blob() )); 
			} 

			blob = await $cache.get(src); 

			console.log("Blob loaded!", blob)
		}
		catch(err)
		{ 
			console.error(err)
			this.$onError.emit(`Failed to load: ${src}`);
		} 

		return blob;
	}

	private clearBlob() {
		this._blob = undefined;
		this.$image.emit( undefined );
	}
 

	//---------------------
	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {

		const superRemove = super.keepInSync(room, isRemote, getPeerId);

		const [ sendSrc, onSrc ] = this.makeRoomAction<string>(room, 'src'); 
		const [ sendBlob, onBlob ] = this.makeRoomAction<Blob>(room, 'img'); 
		const [ clearBlob, onClearBlob ] = this.makeRoomAction(room, 'clear'); 
		const [ sendBgSize, onBgSize ] = this.makeRoomAction<string>(room, 'bg'); 
	 

		if( isRemote ) // phone
		{   
			onBgSize((newSize, peer)=>{
				if( peer==getPeerId())
				{
					this.backgroundSize = newSize;
				}
			})

			onSrc( (newSrc, peer)=>{
				 
				if( peer==getPeerId() )
				{ 
					console.log("Got new src = "+JSON.stringify(newSrc))
					this.src = newSrc==""? undefined : newSrc;
				}
			});

			onBlob((newBlob, peer)=>{
				 
				if( peer==getPeerId() )
				{
					console.log("Got blob", !!newBlob)
					this._blob = newBlob; 
					this.$image.emit( newBlob );
				}
			});

			onClearBlob((_, peer)=>{
				 
				if( peer==getPeerId() )
				{
					this.clearBlob();
				}
			})

			return ()=>{
				superRemove(); 
				onBgSize(CLEAR);
				onSrc(CLEAR);
				onBlob(CLEAR);
				onClearBlob(CLEAR);
			};
		}
		else 
		{   
			const onBgSizeChange = (newSize:string)=>{
				sendBgSize(newSize, getPeerId());
			} 

			this.backgroundSizeChange.on(onBgSizeChange);

			this.onSrcSet = src => {

				const peer = getPeerId(); 

				console.log(`Send src = ${JSON.stringify(src)}`)
				sendSrc(src??"", peer);

				if( !src )
				{ 
					this.clearBlob();
					clearBlob({}, peer);
				}
				else 
				{
					this.loadBlob( src ).then( blob => {
						if( this.src==src )
						{
							this._blob = blob;
							this.$image.emit( blob );
						}
						else 
						{
							console.log("Ignoring blob...")
						}
					});
				} 
			}

			const onImageBlob = (blob:Blob|undefined) =>{
				if( blob )
				{
					console.log("Send blob to phone")
					sendBlob( blob, getPeerId() );
				}
				else 
				{
					clearBlob({},getPeerId());
				}
			}

			this.image.on( onImageBlob ); 

			// if( this.src )
			// {
			// 	this.onSrcSet( this.src );
			// }

			// if( this._blob )
			// {
			// 	onImageBlob( this._blob );
			// } 

			this.syncState = ()=>{ 

				console.log("Sync state pro peer ", this.src, this._blob)

				this.onSrcSet!(this.src); 

				onBgSizeChange( this.backgroundSize ); 
			} 

			return ()=>{
				superRemove();
				this.image.off( onImageBlob );
				this.backgroundSizeChange.off(onBgSizeChange);
			}
		} 
		
	}
} 