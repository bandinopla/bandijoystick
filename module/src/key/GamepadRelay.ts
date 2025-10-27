import type { Room } from "trystero";
import { Signal } from "../utils/Signal"; 
import type { KeyConfig } from "../layout/KeysLayout";
import { CLEAR, Key } from "./Key";
 

type GamepadSlot = {
	index:number
	gamepad:Gamepad|undefined
} 

type RelayConfig = {

	/** 
	 * 0 = 1st joystick detected
	 * 1 = 2nd joystick detected
	 * 2 = etc...
	 * @default 0
	 */
	gamepadIndex?:number
	
	/**
	 * Called if either the buttons or axes have changed
	 */
	onInput?:VoidFunction

	onGamepadConnected?:VoidFunction
	onGamepadDisconnected?:VoidFunction
}

/**
 * Manages a dynamic collection of connected gamepads as "slots."
 * 
 * Handles browser `gamepadconnected` and `gamepaddisconnected` events,
 * maintains an indexed list of active `GamepadSlot` objects, and emits
 * signals when gamepads are connected or disconnected.
 * 
 */
class GamepadSlots {

	private $connected:Signal<GamepadSlot> = new Signal();
	private $disconnected:Signal<GamepadSlot> = new Signal();

	private _slots:GamepadSlot[]=[];

	get connected(){ return this.$connected.asPublic() }
	get disconnected(){ return this.$disconnected.asPublic() }

	constructor(){
		window.addEventListener("gamepadconnected", this.onGamepadConnected);
		window.addEventListener("gamepaddisconnected", this.onGamepadDisConnected);

		//
		// scan the currently connected joysticks....
		//
		navigator.getGamepads().forEach( gamepad => {
			if( gamepad ){
				this.onGamepadConnected({ gamepad });
			}
		});
	}

	private onGamepadConnected = ( ev:{ gamepad:Gamepad }) => {

		const gamepad = navigator.getGamepads()[ev.gamepad.index]!;
		
		const oldIndex = this._slots.findIndex(pad=>pad?.gamepad?.id==gamepad.id);
		if( oldIndex>-1 )
		{
			this._slots[oldIndex].gamepad = undefined;
		}

		let newIndex = this._slots.findIndex(pad=>!pad);

		if( newIndex>=0 )
		{
			this._slots[newIndex].gamepad = gamepad;
		}
		else 
		{
			newIndex = this._slots.push( { index:this._slots.length, gamepad } ) - 1;
		}
 
		if( newIndex!=oldIndex )
			this.$connected.emit( this._slots[newIndex] );

	}

	private onGamepadDisConnected = ( ev:{ gamepad:Gamepad } ) => {
		const slot = this._slots.find(pad=>pad?.gamepad?.id==ev.gamepad.id);

		if( slot )
		{
			this.$disconnected.emit( slot );

			slot.gamepad = undefined;
		} 
	}

	getSlotAt( index:number ) : GamepadSlot | undefined
	{
		return this._slots[index];
	}
}


/**
 * slot index will consists on "first available index" in this array.
 */
const $gamepadSlots = new GamepadSlots();

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API
 * 
 * Eachoes `buttons`, `axes` and `connected`
 * 
 * Kind of suggested by: https://x.com/P0Wrusr/status/1980260086741135456
 * 
 * Motivation: to be able to use a peripheral ( like Gamesir G8 ) to use those buttons instead.  
 * This class basically listens to connected game pads and echoes the status to the server of buttons and axes.
 * 
 * ----
 *  ChatGTP said this about Gamepad upport:
	    " Safari’s Gamepad API support is partial and flaky.
		  Desktop Safari supports navigator.getGamepads() behind a flag or only for standard controllers.
		  iOS Safari? Basically useless — Apple blocks it for “security” (translation: control issues). "
 */
export class GamepadRelay extends Key { 

	private $buttonsChanged:Signal<readonly GamepadButton[]|undefined> = new Signal();
	private $axesChanged:Signal<readonly number[]|undefined> = new Signal();
	private $gamepadConnectedChange:Signal<boolean> = new Signal(); 
	private $mappingChange:Signal<string|undefined> = new Signal(); 

	private onInputHook?:VoidFunction;
	private onGamepadConnectedHook?:VoidFunction;
	private onGamepadDisconnectedHook?:VoidFunction;

	/**
	 * Which gamepad index im listening to?
	 */
	private _gamepadIndex: number;

	private _slot?: GamepadSlot;
	private get slot(){ return this._slot; }
	private set slot( newSlot ) {

		this.reset();

		this._slot = newSlot; 

		this.mapping = newSlot?.gamepad?.mapping;
		this.connected = newSlot?.gamepad?.connected ?? false; 

		if( newSlot )
			this.startPolling();
	}

	/**
	 * This is NOT the `Gamepad.index` it is a custom index value. 
	 * It is the index in chronological order of how the joysticks are expected to be connected. But if unplugged and so it will change like so:
	 * 
	 * First time: user plugs joystick 1 and 2, they both get index 0 and 1.
	 * Your app: for you, index [1] = player 2
	 * If they both unglug and then the person holding what it used to be the "player 2" joystick plugs it again, 
	 * this person will be assigned the first free slot index of [0] being now treated as what your app would consider player 1.
	 * 
	 * -- have that in mind. On `hasConnected` your app should self manage how to treat the the gamepad. This property `gamepadIndex` is the ideal index if all your exepcted joysticks are connected.
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/index
	 */
	get gamepadIndex(){ return this._gamepadIndex; }
	// set gamepadIndex( index:number )
	// {
	// 	const changed = this._gamepadIndex!=index;
	// 	this._gamepadIndex = index;

	// 	if( changed )
	// 	{ 
	// 		const newSlot = $gamepadSlots.getSlotAt( index );

	// 		if( newSlot )
	// 		{
	// 			this.slot = newSlot;
	// 		} 

	// 		//
	// 		// if we had a slot, it probably means we are in the phone... we are the source of data
	// 		//
	// 		else if( this.slot )
	// 		{
	// 			this.slot = undefined;
	// 		} 
	// 		else 
	// 		{
	// 			//
	// 			// if this case happens it means we are probably running in the APP and we are recieving the data from the remote phone
	// 			//
	// 		}
	// 	}
	// }

	private _autoPolling = true; 

	private _lastKnownButtons?:readonly GamepadButton[];
	private _lastKnownAxes?:readonly number[];

	private _gamepadIsConnected = false; 


	private _mapping?:string;

	/** 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/mapping
	 */
	get mapping(){ return this._mapping; } 
	private set mapping( newMapping:string|undefined ) {
		const changed = this._mapping!=newMapping;
		this._mapping = newMapping;
		if( changed ) this.$mappingChange.emit(newMapping);
	}
	get mappingChanged(){ return this.$mappingChange.asPublic() }

	/**
	 * If the physical gamepad / the periferial is connected or not.
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/connected
	 */
	get connected(){ return this._gamepadIsConnected; }
	private set connected( isConnected:boolean ) {
		////const changed = this._gamepadIsConnected !== isConnected;
		this._gamepadIsConnected = isConnected;
		///if( changed )  

		if( isConnected ) this.onGamepadConnectedHook?.();
		else this.onGamepadDisconnectedHook?.();
		
		this.$gamepadConnectedChange.emit(isConnected);
	}

	/**
	 * Fired when the physical peripheral/joystick is connected/disconnected
	 */
	get padConnected() { return this.$gamepadConnectedChange.asPublic() }

	/** 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/buttons
	 */
	get buttons(){ return this._lastKnownButtons; }

	/**
	 * A button was pressed
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/buttons
	 */
	get buttonsChanged(){ return this.$buttonsChanged.asPublic(); }


	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/axes
	 */
	get axes(){ return this._lastKnownAxes; }

	/**
	 * An axes has been moves
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/axes
	 */
	get axesChanged(){ return this.$axesChanged.asPublic(); }
 

	/**
	 * Internal hook to send the changes to the app
	 */
	private sendButtonsState?:( pressed:number, touched:number, values:number[] )=>void;

	/**
	 * Internal hook to send changs to the app
	 */
	private sendAxesState?:( axes:readonly number[])=>void;

	/**
	 * Automatically check the gamepad status on each frame (`requestAnimationFrame`) **OR** you want do do it yourself calling `.updateState()` manually.
	 */
	get autoPolling() { return this._autoPolling; }
	set autoPolling(autoPoll: boolean) {
		this.stopPolling();
		this._autoPolling = autoPoll;
		if (autoPoll) {
			this.startPolling();
		}
	}  
	
	/**
	 * The id of the request animation frame timeout...
	 */
	private rafId: number | undefined; 


	constructor(config: Omit<KeyConfig, "type"> & RelayConfig, kid?: number) {
		super({
			...config, type: "gpad-relay"
		}, kid);

		this._gamepadIndex = config.gamepadIndex ?? 0;

		this.onGamepadConnectedHook = config.onGamepadConnected;
		this.onGamepadDisconnectedHook = config.onGamepadDisconnected;
		this.onInputHook = config.onInput;

		//
		// listen for a game pad connection...
		// 
		$gamepadSlots.connected.on( this.onSlotConnected );
		$gamepadSlots.connected.on( this.onSlotDisconnected ); 

		//
		// initialize if maybe out gamepad is already connected
		//
		const pad = $gamepadSlots.getSlotAt( this._gamepadIndex );
		if( pad )
		{
			//
			// do this on the next frame to allow for the keys setup to complete and "keepInSync" to be called...
			//
			requestAnimationFrame(()=>this.onSlotConnected(pad));
		} 
	}

	override dispose(): void { 

		$gamepadSlots.connected.off( this.onSlotConnected );
		$gamepadSlots.connected.off( this.onSlotDisconnected );
	}
	
	private onSlotConnected = (slot:GamepadSlot) => {
		if( slot.index==this.gamepadIndex && ( !this.slot || this.slot.index==slot.index ) )
		{
			//console.log("Gamepad connected!");
			this.slot = slot; 
		}
	}

	private onSlotDisconnected = (slot:GamepadSlot) => {
		if( this.slot?.index == slot.index )
		{
			this.slot = undefined; 
		}
	}   

	private reset() {
		this.stopPolling();
		
		this._gamepadIsConnected = false;
		this._lastKnownAxes = undefined;
		this._lastKnownButtons = undefined; 
		this._mapping = undefined;
	} 

	private startPolling() { 

		///console.log("Start polling!")

		const loop = () => {
			this.rafId = undefined;

			this.updateState()

			if( this.autoPolling )
			{
				this.rafId = requestAnimationFrame(loop)
			} 
		} 

		loop();
	}


	private stopPolling() {
		if (this.rafId) cancelAnimationFrame(this.rafId)
		this.rafId = undefined; 
	}

	/**
	 * Checks the status of the gamepad
	 */
	updateState() { 
 
		//
		// current gamepad snapshot
		//
		const gp = this.slot?.gamepad? navigator.getGamepads()[ this.slot.gamepad.index ]! : undefined; 

		if (!gp) return;  

		this.mapping = gp.mapping;

		if( gp.connected!=this.connected )
			this.connected = gp.connected; 


		if( gp.connected )
		{
			//
			// send the buttons data
			//
			this.syncButtonsState(gp.buttons);

			//
			// send the axes data
			//
			this.syncAxesState(gp.axes);
		}

	}

	/**
	 * Save the state of the keys...
	 */
	private syncButtonsState(buttons: readonly GamepadButton[]) {   

		let pressed = 0, touched = 0, value=0, changed = false;

		/**
		 * For each button, "pack" the state and also check if there are changes.
		 */
		for (let i = 0; i < buttons.length && i < 32; i++) {

			const btn = buttons[i];

			if (btn.pressed) pressed |= 1 << i;
			if (btn.touched) touched |= 1 << i;

			value = btn.value;

			const old = this._lastKnownButtons?.[i];

			if( !old || (old.value != value) || (old.pressed!=btn.pressed) || (old.touched!=btn.touched) )
			{
				changed = true;
			} 
		}  

		//
		// something has changed from las snapshot...
		//
		if( changed )
		{  
			this._lastKnownButtons = buttons;

			//
			// this hook exists only in the case of the isRemote=true to send the state to the app
			//
			this.sendButtonsState?.(pressed, touched, buttons.map(btn=>btn.value) );

			this.$buttonsChanged.emit( buttons );
			this.onInputHook?.();
		} 

	}

	/**
	 * Save the axes state
	 */
	private syncAxesState( axesState:readonly number[] )
	{  
		const changed = !this._lastKnownAxes || this._lastKnownAxes.some((v,i)=>v!=axesState[i]);

		if( changed )
		{
			
			this._lastKnownAxes = axesState;

			//console.log("AXES Changed!", axesState)

			this.sendAxesState?.(axesState);

			this.$axesChanged.emit(axesState);
			this.onInputHook?.();
		}
	}

	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void {
		const superCleanup = super.keepInSync(room, isRemote, getPeerId);

		const [sendButtonsState, onButtonsState] = this.makeRoomAction<number[]>(room, "btns");
		const [sendAxesState, onAxesState] = this.makeRoomAction<number[]>(room, "axes");
		const [sendConnectionStatus, onConnectionStatus] = this.makeRoomAction<boolean>(room, "conn");
		const [sendMapping, onMapping] = this.makeRoomAction<string>(room, "map");

		//
		// the phone
		//
		if( isRemote ) // im the source of truth
		{
			this.sendButtonsState = (pressed, touched, values) => {
				let peer = getPeerId()

				if( peer ) sendButtonsState([pressed, touched, ...values], peer); 
			}

			this.sendAxesState = axes => {
				let peer = getPeerId() 

				if( peer ) {
					//console.log("Sending axes", axes, "to", peer)
					sendAxesState(axes as number[], peer)
				}; 
			}

			const onConnected = (isConnected:boolean) => sendConnectionStatus(isConnected, getPeerId());

			this.padConnected.on( onConnected );

			const onMaping = (newMapping:string|undefined) => sendMapping(newMapping??"", getPeerId()); 

			this.mappingChanged.on(onMaping);

			return ()=>{
				superCleanup();
				this.sendButtonsState = undefined;
				this.sendAxesState = undefined;
				this.padConnected.off(onConnected);
				this.mappingChanged.off(onMaping);
			}
		}

		//
		// the APP
		//
		else // listen for state change
		{
			//
			// gamepad connected onthe other side?
			//
			onConnectionStatus(( isConnected, peer)=>{ 

				if( peer!=getPeerId() ) return; 
 
				this.connected = isConnected;
			});

			//
			// the mapping changed or was set
			//
			onMapping((newMapping, peer)=>{
				
				if( peer!=getPeerId() ) return; 
				this.mapping = newMapping==""? undefined : newMapping;
			});

			//
			// the phone is sending us the buttons states
			//
			onButtonsState((snap, peer)=>{
				 
				if( peer!=getPeerId() ) return; 


				const pressed = snap[0];
				const touched = snap[1];
				const values = snap.slice(2);

				//
				// initialize buttons array in case we dont have it...
				// 
				this._lastKnownButtons = values.map<GamepadButton>( (value,i)=>({
					pressed:!!(pressed & (1 << i)), 
					touched:!!(touched & (1 << i)),
					value
				}));

				//
				// emit the change event so the app knows that it can now do something.
				// but it can also read the `buttons` property on an enter frame since it was updated.
				//
				this.$buttonsChanged.emit( this._lastKnownButtons );

			});

			//
			// sending us the axes
			//
			onAxesState(( newAxes, peer)=>{
				 
				if( peer!=getPeerId() ) return;

				this._lastKnownAxes = newAxes;
				this.$axesChanged.emit(newAxes);
			});

			return ()=>{
				superCleanup();
				onConnectionStatus(CLEAR);
				onMapping(CLEAR);
				onButtonsState(CLEAR);
				onAxesState(CLEAR);
			}
		}
	}
 

}