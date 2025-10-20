# Let's roll!
Thank you for chosing **BandiJoystick**! This is **a JavaScript library** that wraps around [Trystero](https://oxism.com/trystero/) and allows your web application to use a phone to control it. No apps needed. Serverless.

## Motivation
Sometimes I would like to be able to control an app with the phone acting as a remote control, to be able to be on the couch playing a game I made or an app, etc... and see it on a big screen like the TV. So that's how the idea came out. It should be trivial to use the phone to control things... why not just scan a QR code and that's it? No apps, no weird setup. That's what this aims to be / solve.

## How it works
Your application shows a QR code so the users can scan it with their phones and they will be redirected to a page in their phone's browser that will display a remote controller they will be able to use to control the app.
 
# Installation
To allow users to control your application with their phones you have to install the following modules:

```bash
npm install bandijoystick trystero qrcode
```  

## Import the library
```js
// ESM
import * as BANDI from 'bandijoystick';

//CJS
const BANDI = require('bandijoystick');

//UMD
const BANDI = window.BANDI;
```

## Create the Joystick
In your app, for every "slot" your application needs ( *but remember that this uses webRTC under the hood so the limit is usually 5–8 peers before performance drops.* ) you will create an input slot:

```javascript 
//
// this is the object you will use to read the user's input.
//
const slot = new BANDI.Joystick( "Player 1" );
 
```
That object represents the slot in which the player will "plug" the phone. You will need one per player/user in your application. 

## Add keys/buttons 
You application defined a plug, now it is up to your app to define what keys the "remote control" will show to the user.

```javascript 
//
// Now you define what keys your controller will have
//
slot.setKeys( [
	new BANDI.PushKey(...)
])
```

## Show the QR code
The player will need to scan a QR code so it can be redirected to the joystick webapp in the phone. You app should place this element anywhere on screen that makes sense to you. But remember the QR code should be readable...

```javascript
//
// Show the QR code somewhere on screen so the user can scan it...
// remember call this if you have the qrcode module installed.
//
slot.domElement().then( el => {
	 // place the element somewhere on screen...
	 // this contains a canvas showing the QR Code
}); 
 
```

## Scan the code
Scan the QR code with your phone!

**That's it!** You can now control your app using the phone as a joystick!