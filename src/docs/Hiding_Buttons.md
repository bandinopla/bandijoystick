# Hiding buttons
To manage the layout, the way to go about it is to just hide / show  buttons...

```js
startButton.visible = false;
pauseButton.visible = true;
```

## Layout state
A good pattern I find to switch the buttons is to create an array of button per state and when you want to go to some state you just hide all the button that are not present in this state's array. Like so:

```js
import * as BANDI from 'bandijoystick'; 

const allMyButtons = [
	playButton, 
	resumeButton,  //initial visibility set to false
	pauseButton, //initial visibility set to false
	stopButton //initial visibility set to false
];


player1Joystick.setKeys( allMyButtons );

//
// now we define the "states" of the controller...
//

const initialState = [ playButton ];
const playingState = [ pauseButton, stopButton ];
const pausedState = [ resumeButton, stopButton ];


//
// to switch "states" we just toggle the visibility of the buttons!
//
const setState = (state: typeof BANDI.keys.Key []) => 
	allMyButtons.forEach(key => 
		key.visible = state.includes(key);
); 


//
// And this is how you trigger a "state" change...
//
playButton.clicked.on(()=>{
	// play something... then...
	setState( playingState );
});

```