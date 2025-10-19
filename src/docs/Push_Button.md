# Push Button
A classic button you press and release...

```js
import * as BANDI from "bandijoystick";

const btnStart = new BANDI.PushKey({
	...common button config
	
	//
	// optional quick listener in the config...
	//
	onClicked: () => {
		console.log("This button was pressed!!")
	}
});
```

## Events

#### CLICKED
Pressed **AND** released the button...
```js
btnStart.clicked.on(()=>console.log("clicked by the user!"));
```

#### PRESSED
Pressed **OR** released the button...
```js
btnStart.pressed.on(( isDown:boolean )=>{
	console.log("The user is pushing this button down?", isDown )
});
```