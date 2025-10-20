import { type Room} from 'trystero' 

  

export type ServerConfig = {

	/**
	 * Get a custom trystero room. Use the serverID in the room id, since this will avoid collisions with other App instances.
	 */
	customRoomGetter? : ( serverId:string )=>Room

	/**
	 * URL of the path to use to redirect the user's phone to the remote control webapp
	 */
	remoteControlUrl:string
}

//
//
const defaultConfig : ServerConfig = { 
	remoteControlUrl: import.meta.env.DEV ? import.meta.env.BASE_URL : "https://bandijoystickjs.web.app/" 
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