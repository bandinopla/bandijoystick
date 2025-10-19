# QR Code
The [QR Code](https://en.wikipedia.org/wiki/QR_code) is what allows the user to connect with your app. It links to a webapp that creates a P2P connection from their phone to your app with no server in between.

For every slot in your app where you want to allow users to take over, you create a control. Each control then exposes the following method to obtain this QR code and display it on screen:

## Install qrcode
If you decide to use `domElement()` you'll need to install the `qrcode` module ( *since tha'ts what we use to create the code* )

```bash
npm install qrcode
```

If you don't want to use it, you can generate one yourself using the `url` property of the `BANDI.Joystick` instance.


### DOM element
A div containing the QR code ( in a canvas ) alongside the label can be created with:

```js

// player1Slot is a BandiJoystick instance
player1Slot.domElement().then(el => {
	if (el) {

		//
		// in this example we position it in the bottom middle of the window.
		//
		el.style.position = "fixed";
		el.style.zIndex = "1";
		el.style.left = "50%";
		el.style.transform = " translate(-50%, 0%)";
		el.style.bottom = "0px";
		document.body.appendChild(el);
	}
});
```

The QR code ( *the `el` element* ) will automatically hide when it is "taken" ( *when a user connects to it* ) and will re-appear when the connection is lost as to allow to be re-scanned again.