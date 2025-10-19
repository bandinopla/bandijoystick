# Adding buttons
> A controller / remote is a set of keys / buttons...

You must define the keys the `BANDI.Joystick` will have / display. The keys are what you will use to connect the remote with your app. There are a few kinds of buttons, in this example a classic "push button" is used.

## Create the button
All key types share a common configuration object, and some may add extra properties to it:


```js
import * as BANDI from 'bandijoystick';

const button = new BANDI.PushKey({
 
 	// Unique id to identify this button
	id: "stop", 

 	// [Optional]. CSS horizontal position 
	x: "25%", 

	// [Optional]. CSS Vertical position 
	y: "50%", 

	// width/height size in CSS Length of the container div
	radius: "200px", 

	// [Optional]. ID of a https://feathericons.com
	iconClass: "x",  

	// [Optional]. CSS background color
	background:"red", 

 	// [Optional]. CSS text color
	textColor:"blue",

	// [Optional]. Initial visibility
	visible: true, 

	//
	// Specific to `PushKey` config:
	// when the user clicks this button in the phone
	// this function will be called
	//
	onClicked: () => {
		console.log("The user clicked this button")
	}
}); 
``` 

## Add the buttons
You will ususally only need to call setKeys once, with all of the buttons on your controller and just toggle their visibility on and off to change the layout:

```js
//
// add the buttons to the controller
//
inputPlayer1.setKeys([ button ]); 
```

## That's it
Now the control has a button!