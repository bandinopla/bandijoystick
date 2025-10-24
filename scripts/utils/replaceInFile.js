import fs from "fs"

export function replaceInFile(filePath, what, replacement) {

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