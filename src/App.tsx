
import "./style.css";

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash'
import CopyButtonPlugin from "highlightjs-copy"
import "highlightjs-copy/styles/highlightjs-copy.css";

// Then register the languages you need
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.addPlugin(new CopyButtonPlugin()); 

import { render } from 'preact'
import { lazy, LocationProvider, Route, Router, useRoute } from 'preact-iso'
import { Documentation, DocumentationMenu } from './pages/Documentation';
import { Examples } from './pages/Examples';  
import { useMemo } from "preact/hooks";
import { HomePage } from "./pages/Home";
import DonatePage from "./pages/DonatePage";

const base = import.meta.env.BASE_URL ;

const menu = [
	{
		label: "Learn",
		links: [
			{ label: "Examples", path: "apps" },
			{ label: "Documentation", path: "documentation/overview" },
		]
	},
	{
		label: "Open source!",
		links: [ 
			{ label: "github", path: "https://github.com/bandinopla/bandijoystick" },
		]
	},
	{
		label: "Questions?",
		links: [
			{ label: "@bandinopla", path: "https://x.com/bandinopla" },  
		]
	},
	{
		label: "Give Support",
		links: [ 
			{ label: "Donate", path: "donate" },
		]
	},
]


//-------- example apps --------------
const StopWatchApp = lazy(()=>import("./apps/stopwatch/StopwatchApp"));
const WebcamApp = lazy(()=>import("./apps/webcam/WebcamApp"));
const RCCarApp = lazy(()=>import("./apps/rc-car/RCCarApp"));
/*%NEW_DEMO_CLASS%*/
//--------- end / example apps -------


function MainMenu() {
	const { path } = useRoute(); 

	return <>  
		{menu.map(section => <div key={section.label}>
			
			<nav>
				<div className={"label"}>{section.label}</div>
				{section.links.map(link => <a key={link.label} href={ link.path.startsWith("http")? link.path : base + link.path} className={ path=="/"+link.path?"highlight":"" }>{link.label}</a>)}
			</nav> 
		</div>)} 
	</>
} 

function Website()
{
	const { path } = useRoute(); 

	console.log("path",path)
	return <div className={"flex"}>
					
					<div className={"flex-side-column"}> 
						<a href={import.meta.env.BASE_URL}><img src={`${import.meta.env.BASE_URL}logo.webp`}/></a>
						<Router>
							<Route path="/" component={MainMenu} /> 
							
							<Route path="/documentation/:key?" component={DocumentationMenu} />
							<Route default component={MainMenu} /> 
						</Router> 
						<div style={{marginTop:20, fontSize:"small"}}>version {import.meta.env.PACKAGE_VERSION}-beta</div>
					</div>
					<div className={"mw-800"}>
						<Router>  
							<Route path="/documentation/:key?" component={Documentation} /> 
							<Route path="/apps" component={Examples} /> 
							<Route path="/donate" component={DonatePage} /> 
							<Route default component={HomePage} />
						</Router>
					</div>
					<div className={"video"}> 
						<iframe width="100%" height="315" src="https://www.youtube.com/embed/RfvawPnfTcI?si=TVP7CrNXFIpnkjmx" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
					</div>
				</div>
}




function App() { 

	return <LocationProvider> 
		<Router>
			<Route path={base+"apps/stopwatch"} component={StopWatchApp} /> 
			<Route path={base+"apps/webcam"} component={WebcamApp} /> 
			<Route path={base+"apps/rc-car"} component={RCCarApp} />
			{/*%NEW_DEMO%*/}
			<Route path={base+"*"} component={Website}/>   
			<Route path={base} component={Website}/>   
			
		</Router>
	</LocationProvider>;
}



render(<App />, document.getElementById('app')!)