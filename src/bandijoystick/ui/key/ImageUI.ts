import type { Image } from "bandijoystick";

export function createImageUI( host:HTMLDivElement, key:Image )
{

	const onImageBlob = ( blob:Blob|undefined) => { 
		 
		host.style.backgroundImage = blob ? `url(${ URL.createObjectURL(blob) })` : ""; 
	}

	const onBgSize = (size:string)=>{
		host.style.backgroundSize = size;
	}

	// create the ui for the key...
	key.image.on( onImageBlob );

	onBgSize( key.backgroundSize );
	key.backgroundSizeChange.on( onBgSize );

	return ()=>{
		// if you create something or add listeners, remove them here...
		key.image.off( onImageBlob );
		key.backgroundSizeChange.off( onBgSize );
	}
}