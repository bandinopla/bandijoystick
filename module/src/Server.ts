import {selfId, type Room} from 'trystero'  
import type { KeysLayout } from './layout/KeysLayout';
import { getConfig, type ServerConfig } from './config';

//const randomId = ()=>Math.random().toString(36).slice(2, 10);
let room:Room; 

export class Server { 

	protected _roomId = "yoyodyne";

	protected serverId = selfId;

	/**
	 * Set only after calling get api
	 */
	protected _config:ServerConfig|undefined;

	protected get room(){ return room; }

	protected get api() {

		if(!room)
		{ 
			this._config = { ...getConfig() };
		 	room = this._config.customRoomGetter();
		}  

		return {
			room,
			plug: room.makeAction<number>('plug'),
			plugResponse: room.makeAction<boolean>('plug-resp'),  
			layout: room.makeAction<KeysLayout>('layout')
		}

	}
}