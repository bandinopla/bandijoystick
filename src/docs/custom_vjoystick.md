# Use your own virtual joystick
The virtual joystick ( *The joystick instance that runs on the "phone"* ) is virtually the same as a `BANDI.Joystick` running on your app **BUT** the only diference is that it doesn't set the label and the `isRemote` parameter is set to true:

```js
//
// this means: this joystick will "connect" to an app
//
const vjoystick = new BANDI.Joystick("", true);


// remember "connected" is fired before it has any keys. It can be connected with no keys...
vjoystick.connected.on(...)
vjoystick.disconnected.on(...)
```

Then you have to listen for when it recieves keys:
```js

//
// when the virtual joystick recieves new keys...
//
vjoystick.keysChange.on( newKeys => {

	//
	// You are in charge now to build the UI of the virtual joystick 
	// you basically create the UI and mirror any event happening to the UI into the keys...
	// like if a button is pressed, call the PushKey.isDown = true and so on...
	// 

});
```

Use the [official virtual joystick ](https://github.com/bandinopla/bandijoystick/blob/main/src/bandijoystick/ui/RemoteBandiJoystick.ts) as guide.