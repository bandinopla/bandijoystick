# Directional Stick
The classic "joystick" a 2D vector.

```js
import * as BANDI from 'bandijoystick';

const wheelInput = new BANDI.DirKey({
	... common config
	// It has no extra special config
});
```

## Properties
It has an xy properties that go from -1 to 1:

```bash
      -Y
       |
       |   
-X ----+---- X
       |
       |
       Y
```

```js
wheelInput.x;  
wheelInput.y; 
```

## Events

#### CHANGED
When the user moves this control, you will get this signal, and the xy will also be automatically updated internally in case you are reading them on a frame update.
```js
wheelInput.changed.on( (newX, newY)=>{
	//
	// wheelInput.x and y had been updated, this callback is ueful if you want to do something when the value change...
	//
});
```

