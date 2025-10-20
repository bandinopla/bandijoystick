# NO SERVERS
It uses WebRTC ( P2P ) using [trystero](https://oxism.com/trystero/) to pair an input "slot" in your app to a "remote control" ( a phone ) as to allow a user to control the input from the phone. 

Your app acts as a server, and the remote BANDI.Joystick connects to it.

## Default value
The default room uses a [`firebase`](https://firebase.google.com/) strategy that does use a server, but you can change this. And you should change it and use your own firebase or whatever configuration, the default ones are good for solo developers testing. **And even then, you may want to fully own the connection details.**

```js
import {joinRoom, selfId} from 'trystero/XXXXXX'
import * as BANDI from 'bandijoystick';

//
// call this BEFORE instantiating any BANDI.Joystick
//
BANDI.config({
	customRoomGetter:( serverId:string )=>joinRoom( yourConfig, "your-app"+ serverId ) //<-- use selfId in the room ID...
});
```

### serverId 
using that as part of the room ID avoids collisions. This way the room id is specific to the running app.  