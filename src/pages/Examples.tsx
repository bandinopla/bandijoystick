import { useState } from "preact/hooks";
import styles from "./Examples.module.css";

type ExampleDef = {
	title:string
	thumbnail:string 
	link:string
	desc:string
	source:string
	by: { name:string, link:string }
}

/**
 * Add here the authors of the examples to be referenced in the examples array...
 */
const by = {
	bandinopla: { name:"bandinopla", link:"https://x.com/bandinopla" }
}

/**
 * List examples here... add new ones at the bottom.
 */
const examples :ExampleDef[] = [
	{
		title:"Stopwatch",
		thumbnail:"example-stopwatch.webp",
		link:"stopwatch",
		desc:"Turn the screen into a big stopwatch you can control with your phone. Ideal for training to count rest times.",
		source:"https://github.com/bandinopla/bandijoystick/tree/main/src/apps/stopwatch",
		by: by.bandinopla
	},
	{
		title:"Camera TV",
		thumbnail:"example-camera.webp",
		link:"webcam",
		desc:"Stream your phone's camera into this screen. Ideal for big events or meetings.",
		source:"https://github.com/bandinopla/bandijoystick/tree/main/src/apps/webcam",
		by: by.bandinopla
	},
	{
		title:`RC Car`,
		thumbnail:"example-car.webp",
		link:"rc-car",
		desc:"Showcasing how you can use the phone as a joystick to control a game",
		source:"https://github.com/bandinopla/bandijoystick/tree/main/src/apps/rc-car",
		by: by.bandinopla
	}
]

//
// the examples page...
//
export function Examples() {

	const [ selected, setSelected ] = useState<ExampleDef>();

	return <div className={styles.root}>
		<h1>
			Grab your phone and get ready to control these apps with it!
		</h1>
		<h3 style={{ fontWeight:"100"}}>Each app will show a QR code you should scan with your phone to gain access to the controls.</h3>

		{ selected && <div className={styles.details}>
			<div className={"bsha"}>
				<button className={styles.close} onClick={()=>setSelected(undefined)}>close</button>

				<div style={{ position:"relative", height:80}}>
					<h1>{selected.title}</h1>
					<div className={styles.by} >
							by <a href={selected.by.link} target={"_blank"}>{selected.by.name}</a></div>
				</div>

				<h4>{selected.desc}</h4>

				<button onClick={()=>window.open(import.meta.env.BASE_URL+"apps/"+selected.link,"_self")}>OPEN</button>
				<button className={styles.source} onClick={()=>window.open(selected.source,"_blank")}>SOURCE &lt;/&gt;</button>
			</div>
		</div>}

		<div className={"flex grid"}>
			{
				examples.map((itm, i)=><div key={i} onClick={()=>setSelected(itm)} className={"bsha "+styles.thumbnail} style={{ width:200, height:200, background:"#111", backgroundSize:"cover", backgroundImage:`url(${ import.meta.env.BASE_URL+'thumbnails/'+ itm.thumbnail})` }}>
					
						{itm.title}
						<div className={styles.by} >
							by <a href={itm.by.link} target={"_blank"}>{itm.by.name}</a></div>
				</div>)
			}
		</div>
		<div style={{ marginTop:30 }}>
			Do you want to add examples? <a href="https://github.com/bandinopla/bandijoystick/blob/main/ADDING_EXAMPLES.md" target={"_blank"}>Do a pull request!</a>
		</div>
	</div>
}