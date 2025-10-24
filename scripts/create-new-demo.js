import { confirm, input, } from '@inquirer/prompts';
import fs from "fs"
import chalk from 'chalk';
import { execSync } from "child_process" 
import { replaceInFile } from './utils/replaceInFile.js';
import { copyFolder } from './utils/copyFolder.js';

const log = console.log; 

async function runWidget() {
	const id = await input({ message: "Type the ID of your demo (used in urls and folder name)" });
	const className = await input({ message: "Name of the component's class" });  
	const title = await input({ message: "Title of your demo (keep it short)" });  
	const desc = await input({ message: "Describe what your demo will do, so people understand what they will see..." });  

	//
	// create folder
	//
	const appDir = `src/apps/${id}`;

	copyFolder('src/apps/template', appDir);
	fs.renameSync(`${appDir}/TemplateApp.module.css`, `${appDir}/${className}.module.css`);
	fs.renameSync(`${appDir}/TemplateApp.tsx`, `${appDir}/${className}.tsx`);
	replaceInFile(`${appDir}/${className}.tsx`, "TemplateApp", className);
	log(chalk.green(
		'New example files created at ' +
		chalk.blue.underline.bold(appDir) 
	)); 

	//
	// list it in the site's router
	//
	replaceInFile("src/App.tsx",/(\s+)\/\*%NEW_DEMO_CLASS%\*\//g, `$1const ${className} = lazy(()=>import("./apps/${id}/${className}"));$0`);
	replaceInFile("src/App.tsx",/(\s+)\{\/\*%NEW_DEMO%\*\/\}/g, `$1<Route path={base+"apps/${id}"} component={${className}} />$0`);
	log(chalk.green(
		'Added it to ' +
		chalk.blue.underline.bold("src/App.tsx") 
	));

	const exampleMeta = `	{
		title:"${title}", 
		link:"${id}",
		desc:${JSON.stringify(desc)},
		source:"https://github.com/bandinopla/bandijoystick/tree/main/src/apps/${id}", 
	}, `;

	//
	// list it the examples page
	//
	replaceInFile("src/pages/Examples.tsx",/(\s+)\/\*%NEW_EXAMPLE%\*\//g, `$1${exampleMeta}$0`);
	log(chalk.green(
		'Added it to ' +
		chalk.blue.underline.bold("src/pages/Examples.tsx") 
	)); 

	log(chalk.blueBright(
		'You can now run' +
		chalk.blue.underline.bold("pnpm run dev") + " to start developing."
	))

	log( chalk.yellow.bold("Don't forget to create the thumbnail in ")+ chalk.blue("public/thumbnails/???.webp ")+chalk.yellow.bold("and add it in ")+chalk.blue("src/pages/Examples.tsx") )
}

try {
	await runWidget()
}
catch (error) {
	if (error instanceof Error && error.name === 'ExitPromptError') {
		console.log('👋 until next time!');
	} else {
		// Rethrow unknown errors
		throw error;
	}
}
