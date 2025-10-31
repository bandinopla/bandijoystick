# Joystick

The class that manages a remote ( **the link between your app and a phone** ) is `BANDI.Joystick`
This class represents the input of 1 single user.

**One Per user**, you create an instance of it, add buttons to it and hook to events to trigger actions in your app. You can also change their visibility to change the layout based on some state ( *see hiding buttons* ).

## Usage
```js
import * as BANDI from 'bandijoystick';

//
// You create one per player/user.
//
const inputPlayer1 = new BANDI.Joystick("Player 1");
const inputPlayer2 = new BANDI.Joystick("Player 2");
/// ...etc

//
// per control, define the buttons ( see "adding buttons" )
//
// 
inputPlayer1.setKeys( ...player1Buttons ); 
inputPlayer2.setKeys( ...player2Buttons ); 
/// ...etc

``` 
 
### constructor
The first argument in `BandiJoystick` is the label to be shown in the UI so the player can see what the control is.  

## Events
This class has the following signal events:
```js
inputPlayer1.connected.on(()=>console.log("Player 1 has connected"));
inputPlayer1.disconnected.on(()=>console.log("Player 1 has disconnected"));

``` 

# Connecting
By default it will use a [Firebase setup](https://github.com/dmotz/trystero?tab=readme-ov-file#firebase-setup) but if you want to use another type of connection of you want to code your own phone's ui, you can do so by overriding the following properties:

```js
import { joinRoom } from 'trystero/xxx';

//
// call this before starting any BANDI.Joystick
//
BANDI.config({

	//
	// you only need to override this is you are going to develop your own phone controller handler.
	//
	remoteControlUrl:"..." // url where the phone will be redirected when the QR code is scanned. Default value is: https://bandijoystickjs.web.app/ 
	
	//
	// by default a trystero/firebase room is used
	//
	customRoomGetter: ()=>{
		return joinRoom(...); // your custom trystero room
	}
});

```

The user will need to scan a QR code that will redirect their phone to a web app with the joystick app in it. See the "QR code" section. The user's phone will open the following url to connect with your app:

```js
inputPlayer1.url 
```


# That's it
The class will handle the connection details. You now will interact with the controler adding event listeners to the keys / buttons. 