import { marked } from 'marked'; 
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import 'highlight.js/styles/github-dark.css'; 
import { useLocation, useRoute, type RoutePropsForPath } from 'preact-iso';
import { slugify } from '../utils/slugify';
import styles from "./Documentation.module.css";

// hljs.registerLanguage('bash', bash);
// hljs.registerLanguage('javascript', javascript);

type DocProps = RoutePropsForPath<'/documentation/:key'>;


import pages from "../docs/index";
  

//const url2key = (source:string)=>source.substring( source.lastIndexOf("/")+1, source.lastIndexOf(".") );

export function DocumentationMenu(props: DocProps) {
	const { path } = useRoute(); 
	const { route } = useLocation();

	const basePath = path.lastIndexOf("/")>0? path.substring(0, path.lastIndexOf("/") ) : path; 
 
	return <nav>
		{ pages.map( (source, i)=>{

			if( typeof source !== 'string' )
			{  

				return <div key={i}><a href={import.meta.env.BASE_URL+"documentation/"+source.slug} className={source.slug==props.params.key?"highlight":""}>{ source.label }</a></div>
			}
			else 
			{
				return <div key={i} className={"label"}>{source}</div>
			}

		})}
	</nav>
}


export function Documentation(props: DocProps) {
	const div = useRef<HTMLDivElement>(null);
	const [doc, setDoc] = useState("");
 

	useEffect(()=>{

		
		const url = pages.filter(itm=>typeof itm!=='string').find( (itm,i)=>(!props.params.key && i==1)? itm : itm.slug==props.params.key )?.url;
 
		if(!url)
		{ 
			setDoc("--- Invalid URL ---");
		}
		else 
		{
			fetch(url).then( resp => resp.text( )).then( text => {

				text = marked.parse( text ) as string;   
				setDoc(text);

				requestAnimationFrame(()=>hljs.highlightAll())

			});
		} 
		

	},[]);
 
	console.log("KEY DOC", props)

	// useLayoutEffect(()=>{

	// 	div.current?.querySelectorAll("code").forEach( code => {
	// 		switch( code.className )
	// 		{
	// 			case "language-bash":
	// 				code.innerHTML = hljs.highlight(
	// 								  code.innerText,
	// 								  { language: 'bash' }
	// 								).value;  
	// 				break;

	// 			case "language-js":
	// 				code.innerHTML = hljs.highlight(
	// 								  code.innerText,
	// 								  { language: 'javascript' }
	// 								).value;  
	// 				break;
	// 		}
	// 	});

	// }, []);

	//

	return <div ref={div} dangerouslySetInnerHTML={{ __html:  doc as string }} className={styles.root}>
		loading...
	</div>
}