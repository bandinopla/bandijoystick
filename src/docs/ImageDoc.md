# Image
Shows an image on the phone's side. It will be set as the background of the containing [div element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement) of this UI. It was designed to let the app be the source of truth, and the remote key just listens to the app.

## Usage
Image extends `PushKey` so it inherit all it's events.

```js
const coolImage = new BANDI.Image({
	id:"avatar",
	x:"50%",
	y:"50%",
	radius: "200px",

	// youc an set the src here 
	src:"./cool-cat-30x30.jpg",
	backgroundSize:"cover",

	// optional
	onClicked: () => {
		console.log("The image was clicked!")
	}
});

// you can set these values at any time... and they will be synced with the remote key
coolImage.src = "./cool-dog.jpg"; 
coolImage.backgroundSize = "50%";

```

## Properties
- `src` the string url of the image. If set to `undefined` it will remove the image.
- `backgroundSize` css property for the [`background-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size)
- `imageBlob` the [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) of the currently loaded mage

## Remove image
```js
coolImage.src = undefined;
```

## Events
 
### Blob Set
```js
//
// To get the Blob loaded or un-set use this signal...
//
coolImage.image.on( (blob:Blob|undefined) => {
	
});
 
```

### Background size changed
```js  
//
// backgroundSizeChange set | unset
//
coolImage.backgroundSizeChange.on( newSize => {
	
})
```

### + Button events
Since it extends `BANDI.PushKey`, it has the same events.