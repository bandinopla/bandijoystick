import { Signal } from "bandijoystick";
import { Button } from "./Button";
import styles from "./CameraStreamDisplay.module.css";

export class CameraStreamDisplay {

	private $onError = new Signal();
	readonly dom:HTMLDivElement; 
	private _stream:MediaStream|undefined;

	readonly dispose:VoidFunction;
	readonly reset:VoidFunction;
 
	private onStream?:( stream:MediaStream )=>void;
	
	getCameraStream?:()=>Promise<MediaStream>;
	get onError(){return this.$onError.asPublic()}
 

	constructor(){

		const div = document.createElement("div");
		this.dom = div;

		div.style.width = "20vw";
		div.style.height = "20vw";
		div.style.margin = "auto";

		const btn = new Button( "video" );
		div.appendChild( btn.dom );

		var requestCamera :Promise<MediaStream>|undefined;

		btn.dom.addEventListener("touchstart", ()=>{

			console.log("KLICK ON CAMERA BUTTON!!!!");
			//request camera...
			if(!requestCamera)
			{
				requestCamera = this.getCameraStream?.();
			}

			requestCamera?.then( stream => {

				this._stream = stream;
				this.onStream?.(stream);

			}, ()=>{

				requestCamera = undefined;

			});
		});

		var video:HTMLVideoElement|undefined;
		var currentStream:MediaStream|undefined; 

		/**
		 * Create a video to see the video stream. And listen to the "ended" on the stream to go back our UI to the initial state.
		 */
		this.onStream = stream => { 

			if( stream )
			{
				console.log("Append VIDEO...", stream);

				// show feed in a video
				if(!video)
				{
					video = document.createElement("video"); 
					video.classList.add( styles.video );
					video.autoplay = true;
				}

				currentStream = stream; 

				div.appendChild(video);
				video.srcObject = stream;
				btn.dom.style.display="none"; 
			} 

		};

		this.reset = ()=>{
			if( video )
			{
				requestCamera = undefined;
				video.srcObject = null;
				video.remove();
				btn.dom.style.display=""; 
			}
		}
 

		this.dispose = ()=>{  
			this.reset()
			div.remove();
			//todo: remove listener from btn.dom
		}

	}
}