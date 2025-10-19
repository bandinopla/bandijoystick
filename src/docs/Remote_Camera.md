# Remote Camera
To get a feed from the remote camera you use the `CameraStream` "key". This will display a button that the user will have to click to grant access to the camera and initiate a camera stream with your app:

```js
import * as BANDI* from "bandijoystick";

const cameraBtn = new BANDI.CameraStream({
	...common config
}); 
```

## Get the stream
You will get a [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) object:

```js
cameraBtn.onStream.on(stream => { 
	
	//
	// stream started!
	//  
	if( stream )
	{
		someVideo.srcObj = stream;
	} 

	
	//
	// stream ended!
	//  
	else 
	{
		someVideo.srcObj = null; 
	}
});

```

## Stop the stream
Both the client or your app can end the stream:

```js
cameraBtn.stopCameraStream()
```

