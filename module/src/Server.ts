import {selfId, type Room} from 'trystero'  
import type { KeysLayout } from './layout/KeysLayout';
import { getConfig, type ServerConfig } from './config';
import { joinRoom } from 'trystero/firebase';

let room:Room; 

export class Server { 

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
		 	room = this._config.customRoomGetter?.() ?? (joinRoom({ appId: 'https://trystero-3e31b-default-rtdb.firebaseio.com/' }, "room-"+this.serverId));
		}  

		return {
			room,
			plug: room.makeAction<number>('plug'),
			plugResponse: room.makeAction<boolean>('plug-resp'),  
			layout: room.makeAction<KeysLayout>('layout')
		}

	}
}