import { confirm, input,  } from '@inquirer/prompts';
import fs from "fs"
import chalk from 'chalk';
import { execSync } from "child_process"

/**********************************************************************************
 * 
 * 				Automate the tedius task of adding a new Key Type 
 * 
 **********************************************************************************/

const log = console.log; 

function replaceInFile(filePath, what, replacement) {

	let [fname, toFileName] = filePath.split("-->");

	toFileName = (toFileName ?? fname);

	let text = fs.readFileSync(fname, "utf8")

	if( replacement )
	{
		text = text.replaceAll(what, (...args) => {
			return replacement.replace(/\$(\d+)/g, (_, n) => args[+n] ?? "")
		})
	}
	else 
	{
		text = text.trim() +"\n"+what.trim();
	}
	

	fs.writeFileSync(toFileName, text)
}

try
{ 
	const answer = await confirm({ message: `This will add and edit a bunch of files. 
I'm asuming you will use reasonable ids and class names as to avoid collisions with existing data. 
You are a smart dev, right?` })

	if( !answer )
	{
		let err = new Error();
		err.name = "ExitPromptError";
		throw err;
	}

	const buttonType = await input({ message: "What should be the id of the new button's type" });
	const className = await input({ message: "Name of the new Key's class name" });  

	//
	// Add button type...
	//
	let file = "module/src/layout/KeysLayout.ts";

	replaceInFile(file, "export type ButtonType =", `$0 "${buttonType}" |`)
	log(chalk.green(
		'Type added to ' +
		chalk.blue.underline.bold(file) 
	));

	//
	// Create Key Class
	//
	file = "module/src/key/_template.ts";
	let newFile = `module/src/key/${className}.ts`
	replaceInFile(file+`-->${newFile}`, /CLASSKey/g, className);
	replaceInFile(newFile, `type:"button"`, `type:"${buttonType}"`); 
	log(chalk.green( 'Created new class ' + chalk.blue.underline.bold(newFile) ));

	//
	// Export class
	//
	file = "module/src/key/module.ts";
	replaceInFile(file, `
	export { ${className} } from "./${className}";`);
	log(chalk.green( 'Exported key in ' + chalk.blue.underline.bold(file) ));

	//
	// Add mapping Type --> Class
	//
	file = "module/src/key/factory.ts";
	replaceInFile(file, "import {", `$0 ${className},` );
	replaceInFile(file, /(\s+)(\/\/%INSERT_NEW_MAPPING%)/g, `$1,"${buttonType}":${className}$1$2` )
	log(chalk.green( 'Added mapping in ' + chalk.blue.underline.bold(file) ));

	//
	// UI Key Class
	//
	file = "src/bandijoystick/ui/key/_template.ts";
	newFile = file.replace("_template",className+"UI");
	replaceInFile(`${file}-->${newFile}`, "PushKey", className );
	replaceInFile(newFile, "createButton", `create${className}UI` ); 
	log(chalk.green( 'Added UI Key class in ' + chalk.blue.underline.bold(file) ));

	//
	// Add UI to factory
	//
	file = "src/bandijoystick/ui/key/factory.ts";
	replaceInFile(file, `//%IMPORT%`, `import { create${className}UI } from "./${className}UI";
$0`, className );
	replaceInFile(file, /(\s+)(\/\/%INSERT_NEW_MAPPING%)/g, `$1,"${buttonType}":create${className}UI$1$2` );
	log(chalk.green( 'Added UI to the factory' + chalk.blue.underline.bold(file) ));

	//
	// Create documentation File
	//
	file = "src/docs/Push_Button.md";
	newFile = `src/docs/${className}Doc.md`
	replaceInFile(file+"-->"+newFile, /.*/g, `` );
	log(chalk.green( 'Empty documentation file created in ' + chalk.blue.underline.bold(newFile) ));

	//
	// link documentation file
	//
	const doc = { file: `${className}Doc.md`, slug: className.toLowerCase(), label: className }; 
	//
	// update documentation doc script
	//
	file = "src/docs/update-docs.js";
	replaceInFile(file, /(\s+)(\/\/%NEW-KEY%)/g, JSON.stringify(doc)+",$0" ); 
	log(chalk.green( 'Documentation linked in ' + chalk.blue.underline.bold(file) ));

	execSync("pnpm run update:docs", { stdio: "inherit" })

	log( chalk.bold.green("Done! 👋 Happy coding!") );

} catch(error) {
	if (error instanceof Error && error.name === 'ExitPromptError') {
    console.log('👋 until next time!');
  } else {
    // Rethrow unknown errors
    throw error;
  }
}
