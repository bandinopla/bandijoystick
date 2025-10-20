# More to come!
This library is young and still growing! More key types will be added in the future either by me and/or by awesome developers that decide to collab and expand it!

# Adding more buttons
If you want to add more buttons, drop a [pull request](https://github.com/bandinopla/bandijoystick/pulls) and remember to work on a new branch. I'll explain now what a button is...

## Location
Keys are defined in [`module/src/key`](https://github.com/bandinopla/bandijoystick/tree/main/module/src/key) so put new keys there.

## Definition
A button/key is a class that contains some state ( *think of the "isDown" property of a button* ) and extends the [`Key` class](https://github.com/bandinopla/bandijoystick/blob/main/module/src/key/Key.ts) which is almost empty but it has some code to handle the `visible` property of all keys ( *all keys have a visible property used to hide or show them* )

The method that does the "magic" of syncing is `keepInSync`. This method is in charge of basically listening to the changed in the key's own state and mirror the changes to the Key living in the app. 

```text
[Phone's Key] <====> [App's key]
```

## The `keepInSync` Method
This function is called when the key is instantiated. It will acti diferently depending on if the key is remote ( *running on the phone* ) or on the app ( *the pc / tv* )
The goal here is to mirror or mimic the changes of the key. Usually, the phone will be the **source of truth** meaning: if the user clicks a button, logically, you have to mimic the push of the button in the application.
 


## Sample template
Read the comments in the code...

```js 
export class BananaKey extends BANDI.Key {

	private _isBananaHappy = false;
	protected $bananaChanged= new BANDI.Signal<boolean>();

	constructor( config:Omit<KeyConfig, "type"> & quickListeners, kid?:number ){
		super({
			...config, type:"banana-btn"
		}, kid); // kid = the "id" of the button that the app developer has set for this button
	}

	get isBananaHappy(){ return this._isBananaHappy; }
	set isBananaHappy( yes:boolean ){ 
		this._isBananaHappy = yes; 
		this.$bananaChanged.emit(yes); // you shoudl emit changes, because this makes it cleaner and easyer to "sync" the banana key.
	}

	//
	// the magic "sync" method. The return is a function to cleanup / remove any listener created in this function.
	//
	override keepInSync(room: Room, isRemote: boolean, getPeerId: () => string | undefined): () => void 
	{
		//
		// save the super "cleanup" function...
		//
		const superRemove = super.keepInSync(room, isRemote, getPeerId);

		const [ setBananaHappy, onSetBananaHappy ] = this.makeRoomAction<boolean>(room, 'bb'); 

		//
		// If remote = true, it means we are the virtual joystick in the phone. Our job is to send our state to the "app" since the source of truth is the user.
		//
		if( isRemote ) // phone
		{
			const bananaListener = (newValue:boolean) => {

				//
				// send it to our twin Key in the app's side...
				//
				setBananaHappy(newValue, getPeerId())
			}

			//
			// if banana changes in the phone, send it to the app...
			//
			this.$bananaChanged.on( bananaListener );

			return ()=>{
				superRemove(); // call cleanup of the parent...
				this.$bananaChanged.off( bananaListener ); // cleanup ourselves...
			};
		}
		//
		// else, we are running in the "app" we have to listen to what the peer says and mimic it...
		//
		else 
		{
			let removed = false; // idk how to remove trystero's action listeners so....

			//
			// banana changed on the phone side... check if this message is for us...
			//
			onSetBananaHappy( (isHappy, peerId ) => {
				if( removed ) return;
				if( peerId==getPeerId() )
				{
					//
					// mirror the state
					//
					this.isBananaHappy = isHappy;
				}
			});

			//
			// our cleanup function
			//
			return ()=>{
				superRemove();
				removed=true;
			}
		}
	}

}
```

That's it!

