import { useEffect, useMemo } from "preact/hooks";

// Using ES6 import syntax
import hljs from 'highlight.js/lib/core'; 

export function HomePage() {

	const bash = 'npm install bandijoystick trystero qrcode';

	const js = `import * as BANDI from 'bandijoystick';

const input = new BANDI.Joystick( "Player 1" );

// add some buttons!
input.setKeys( [
	new BANDI.PushKey({
		id:"myCoolBtn",
		radius:"200px",
		onClicked: ()=>console.log("YEEEHH HAAAAAA!")
	})
]);

// listen...
input.connected.on(()=>console.log("Player 1 has joined da game, ya'll!!!"));

//add it to the page
input.domElement().then( el => document.body.appendChild(el) ); 
`;

	useEffect(()=>hljs.highlightAll(),[]);

	return <div> 
		<div className={"hero"}>
			<h1>Turn a phone into a remote controller</h1>
			<h2>No apps. No installations. Serverless. Just scan & play!</h2>
			<div>
				<a className={"fancyBtn"} href={import.meta.env.BASE_URL+"documentation/overview"}>Get started - It's free!</a>
				<a className={"fancyBtn grey"} href={import.meta.env.BASE_URL+"apps"}>Examples</a>
			</div>
			<div className={"example"}>
				---<br/>
				Is dead simple:
				<pre><code className={"hljs"} dangerouslySetInnerHTML={{ __html:bash }}></code></pre>
				Then, in your app:
				<pre><code className={"hljs"} dangerouslySetInnerHTML={{ __html:js }}></code></pre>
				Now <b>scan the QR code</b> shown in your app with your phone. 
				That's it!
			</div>
		</div>
	</div>
}