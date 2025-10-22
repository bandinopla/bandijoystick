import { Page, Browser, BrowserContext } from '@playwright/test';
import chalk from 'chalk'
import * as BANDI from "../module/src/module";

const testUrl = 'https://localhost:8080/tests'

declare global {
  interface Window {
    BANDI: typeof BANDI;      // or the proper type
    trystero: any;   // if needed
	 
  }
}

const colorize = ['blue', 'red', 'green', 'cyan', 'magenta', 'yellow'] as const; 
const chalkFunctions = colorize.map(color => chalk[color]); 

async function setupPage(page:Page, index:number, role:string )
{ 
	page.on('console', msg => console.log( `${ chalkFunctions[index](role) } : ${msg.text()}` ));

	await page.setContent(`
		  <script type="importmap">
		    {
		      "imports": {
		        "trystero": "https://esm.sh/trystero@0.22.0",
		        "trystero/firebase": "https://esm.sh/trystero@0.22.0/firebase.js" 
		      }
		    }
		  </script>
		`);
		//@ts-ignore
	await page.evaluate( async () => window.BANDI = await import("http://localhost:5173/module/src/module.ts") );
} 

type Url = string;
type Test = {
	check?:(what:any)=>void 
}
type ServerTest = Test & {
	server:()=>Promise<any> 
}
type PhoneTest = Test & {
	phone:()=>Promise<any> 
}
type PingPongTestConfig = {

	/**
	 * Will run inside the app tab. Create and condifure the bandi joystick. Must return the URL of the slot created for the phone.
	 */
	appSetup:()=>Promise<Url>

	/**
	 * pre init script for the app page
	 * @see https://playwright.dev/docs/api/class-page#page-add-init-script
	 */
	appInitScript?:VoidFunction,

	/**
	 * pre init page for the phone page
	 * @see https://playwright.dev/docs/api/class-page#page-add-init-script
	 */
	phoneInitScript?:VoidFunction,

	tests:(ServerTest|PhoneTest)[]
}

type PlaywrightTestArgs = {
  page: Page;
  context: BrowserContext;
  browser: Browser;  
};

type testFunction =  (args: PlaywrightTestArgs) => Promise<void> | void;


export function pingPongTester( config:PingPongTestConfig ):testFunction {
	return async function( { page:app, browser }) { 
		
		const context = await browser.newContext(); 

		if( config.appInitScript )
			await app.addInitScript(config.appInitScript);

		await app.goto(testUrl);
		await setupPage(app,0,"App");

		const slotUrl = await app.evaluate( config.appSetup );

		const phoneUrl = testUrl+"?"+slotUrl.split("?")[1];

		const phone = await context.newPage();

		if( config.phoneInitScript )
		{
			await phone.addInitScript(config.phoneInitScript);
			console.log("Phoe init scrip runned")
		}

		await phone.goto( phoneUrl );
		await setupPage( phone, 1, "Phone" );


			

		for (let i = 0; i < config.tests.length; i++) {
			const tester = config.tests[i];
			let page:Page;
			let evalFunction:()=>Promise<any>;

			if( "phone" in tester )
			{
				page = phone;
				evalFunction = tester.phone;
			}
			else 
			{ 
				page = app;
				evalFunction = tester.server;
			}
 
			const result = await page.evaluate( evalFunction );

			if( tester.check )
			{
				tester.check(result);
			}
		}

	} 
}

// test('Basic interaction', async ({ page, browser, browserName }) => { 
 
//     const context = await browser.newContext();  

// 	await page.goto(testUrl);
// 	await setupPage(page,0,"App");

// 	// start server app
// 	const slotUrl = await page.evaluate(()=>{

// 		const slot = new window.BANDI.Joystick("Player1", false);
// 		const push = new window.BANDI.PushKey({
// 			id:"push",
// 			radius:"100px", 
// 			onClicked:()=>{
// 				console.log("Push button clicked!!");

// 				//@ts-ignore
// 				window.btnClicked = true;
// 			}
// 		});

// 		slot.connected.on(()=>{
// 			console.log("Peer connected!") 
// 		});
// 		slot.connected.off(()=>{
// 			console.log("Peer disconnected, bye!")
// 		});

// 		slot.setKeys([ push ]); 

// 		return slot.url; 
// 	});

// 	const phone = await context.newPage();
// 	const phoneUrl = testUrl+"?"+slotUrl.split("?")[1];
// 	console.log( phoneUrl );

// 	await phone.goto( phoneUrl );
// 	await setupPage( phone, 1, "Phone #1" );

// 	// connect phone to server app...
// 	await phone.evaluate(()=>{
// 		const slot = new window.BANDI.Joystick(undefined, true); 

// 		return new Promise<void>( resolve => {

// 			slot.keysChange.on( keys=>{

// 				console.log("Clicking the button...");

// 				//@ts-ignore
// 				keys[0].isPressed = true;

// 				//@ts-ignore
// 				keys[0].isPressed = false;
// 				resolve()

// 				// setTimeout(()=>{

// 				// 	//@ts-ignore
// 				// 	keys[0].isPressed = false;


// 				// 	console.log("Done...")
// 				// 	setTimeout( resolve, 500 );

// 				// },200);
 
				 
				
// 			});

// 			slot.connected.on(()=>console.log("Connected to app!"))
			
// 		}); 
// 	});

// 	const clickDetected = await page.evaluate(()=>{
// 		return (window as any).btnClicked;
// 	});
 

// 	expect(clickDetected).toBeTruthy();
  
 
// });
 