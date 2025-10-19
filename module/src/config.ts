import { type Room} from 'trystero'
import { joinRoom } from 'trystero/firebase';

  

export type ServerConfig = {

	/**
	 * Get a custom trystero room
	 */
	customRoomGetter : ()=>Room

	/**
	 * URL of the path to use to redirect the user's phone to the remote control webapp
	 */
	remoteControlUrl:string
}

//
//
const defaultConfig : ServerConfig = {
	customRoomGetter: ()=>joinRoom({ appId: 'https://trystero-3e31b-default-rtdb.firebaseio.com/' }, "room-"+crypto.randomUUID().replace(/-/g, '').substring(0, 10)),
	remoteControlUrl: import.meta.env.DEV ? import.meta.env.BASE_URL : "https://bandijoystickjs.web.app/" //"http://localhost:5173/"
}

let $config : ServerConfig = defaultConfig;

/**
 * Set the config to be used by the server app.
 */
export function config(cfg:Partial<ServerConfig>|undefined) {
	$config = { 
		...defaultConfig,
		...cfg
	};
}

/**
 * Get the config so we know where to connect...
 */
export function getConfig(){
	return $config;
}