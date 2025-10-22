# Automated tests
We use [Playwright](https://playwright.dev/) to automate the tests in [`/tests`](https://github.com/bandinopla/bandijoystick/tree/main/tests)

```bash
pnpm run test
``` 
Or in [UI Mode](https://playwright.dev/docs/test-ui-mode)
```bash
pnpm run test:ui
``` 
The config will run 2 webServers:
1. **localhost:8080** a basic "serve". The test url will be `/tests/index.html`. Useful for quick tests focusing on just they Keys, no UI.
2. **localhost:5173** The vite dev server. Useful to do UI tests. So you can edit files and they will be updated in the test.

## Ping Pong tester
For the case where you want to test a ping pong between an app and the phone with no UI, just a quick way to test if the keys work.

The functions from this config **will run inside of the browser tab of the app or phone**, not in the environment running the test!

```js
import { test, expect } from '@playwright/test';
import { pingPongTester } from './base';

test('Exampe test', pingPongTester( { 
	
	// OPTIONAL 
	appInitScript: async ()=>{
		// do something to setup the app window or something
	},

	// OPTIONAL 
	phoneInitScript: async ()=>{
		// do something to setup the phone window or something, like mocking global functions....
	},

	// REQUIRED:the code that creates the Joystick in the app (not the phone)
	appSetup: async ()=>{
		const slot = new window.BANDI.Joystick("Player1", false);

		slot.connected.on( ()=>(window as any).someFlag = 123; )
	},

	// REQURIED: the tests. Will run in sequence... 
	tests: [
		{
			async phone() { 
				const slot = new window.BANDI.Joystick("", true);
				slot.connected.on(()=>console.log("Connected to the app!") );  
			}
			// OPTIONAL: check(what) {}
		},
		{
			async server() {
				return (window as any).someFlag;
			},
			
			// OPTIONAL: a check function will recieve whatever the phone or server functions returned...
			check(what) { 
				expect(what).toEqual(123);
			},
		}
	]

} ));
``` 