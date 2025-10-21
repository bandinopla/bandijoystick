# Gamepad Relay
Relays the [Gamepad](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) from the user's phone to your app.
This was suggested by [@P0Wrusr](https://x.com/P0Wrusr/status/1980260086741135456) asking if he could use his gamepad peripheral.

<img src="/periferial.webp"/>

## Usage

```js
const pad = new BANDI.GamepadRelay({ 

	x:"50%",
	y:"50%",

	//
	// visually this will look like a "led" so make it tiny...
	//
	radius:"5vw",

	//
	// color of the "led's light"
	//
	background:"blue",

	//
	// This is the gamepad index you care about listening to...
	// 
	gamepadIndex:0, // 0 = first available joystick

	//optional
	onInput: ()=>console.log("Gamepad key or axis used..."),

	//optional
	onGamepadConnected: ()=>console.log("Gamepad plugged..."),
	onGamepadDisconnected: ()=>console.log("Gamepad un-plugged..."),
});   

```

### Polling...
By default it will read the gamepad info on every [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) but you can decide to de it manually:

```js
pad.autoPolling = false; //and you have to do it yourself calling...
pad.updateState(); //<-- will attempt to read the gamepad if any...
```

### Connected
To read the [connected](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/connected) status of the gamepad:
```js
// read...
pad.connected;

// react if changed
pad.padConnected.on( isConnected => {
	// do something if is connected
})
```

### Mapping
To read the [mapping](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/mapping) of the gamepad:
```js
// read...
pad.mapping;

// react if changed
pad.mappingChanged.on( newMappingValue => {
	// do something if is connected
})
```

### Buttons
To get the [Gamepad.buttons](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/buttons) of the gamepad:
```js
//
// read on demain
//
pad.buttons; //<--- may be undefined

//
// read buttons if something is pressed or changes...
//
pad.buttonsChanged.add( buttons => {
	if( buttons )
	{
		// do something based on buttons...
	}
});

```

### Axes
To get the [Gamepad.axes](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/axes) of the gamepad:
```js
//
// read on demain
//
pad.axes; //<--- may be undefined

//
// read buttons if something is pressed or changes...
//
pad.axesChanged.add( axes => {
	if( axes )
	{
		// do something based on buttons...
	}
});

```