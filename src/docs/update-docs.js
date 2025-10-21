/********************************************************************************************
 * 
 * 				this script uses the "files" array to build the "index.ts"
 * 
 * ******************************************************************************************
 */ 
import fs from 'fs';
import path from 'path';
 

//
// I set manually this index because I may need to change the order or hide/show docs manually
//
 
const files = [
  "Documentation",
  { file: "overview.md", slug: "overview", label: "Overview" },
  { file: "serverless.md", slug: "serverless", label: "Serverless" },
  { file: "Joystick.md", slug: "joystick", label: "Joystick" },
  { file: "Adding_Buttons.md", slug: "adding-buttons", label: "Adding Buttons" },
  { file: "Hiding_Buttons.md", slug: "hiding-buttons", label: "Hiding Buttons" },
  { file: "qr_code.md", slug: "qr-code", label: "QR Code" },
  "Design",
  { file: "architecture.md", slug: "architecture", label: "Architecture" },
  { file: "custom_vjoystick.md" , slug: "custom-vjoystick", label: "Custom VJoystick" },
  "Button types",
  { file: "Push_Button.md", slug: "push-button", label: "Push Button" },
  { file: "Directional_Stick.md", slug: "directional_stick", label: "Directional Stick" },
  { file: "Remote_Camera.md", slug: "remote-camera", label: "Remote Camera" },
  { file: "gamepad_relay.md", slug: "gamepad-relay", label: "Gamead Relay" },
  { file: "more_buttons.md", slug: "more-buttons", label: "+ More buttons" }
];



//-----------------------------------------------------------------------------------------------------------
const folder = path.dirname(import.meta.url.replace('file://',''));
const imports = files.filter(f=>f.file?.endsWith(".md")).map(f => { 
  return `import ${f.file.split(".")[0]} from './${f.file}?url';`;
});

const exportLine = `export default [${files.map(f => {

	let itm = JSON.stringify(f);

	if( typeof f!=='string' )
	{
		itm = itm.replace("}", `,"url":` + f.file.split(".")[0] + "}");
	}
	return itm;
} ).join(', ')}] as const;`;

fs.writeFileSync(path.join(folder, 'index.ts'), `
//
// generated automatically by update-docs.js : run the script "update:docs"
//
`+ imports.join('\n') + '\n\n' + exportLine);
