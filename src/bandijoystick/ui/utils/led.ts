/**
 * Just a quick way to change the color of a div acting like an "LED"
 * @param host the div that will be acting as the LED
 * @param color color when ON
 * @returns a function that can be called to set the LED intensity
 */
export const createLED = ( host:HTMLDivElement, color?:string ) => {
	
	host.style.transition = "background-color .5s, opacity .2s";
	
	return ( intensity:number ) => {
		host.style.backgroundColor = intensity>0? color ?? "green" : "#222";
		host.style.opacity = `${intensity*100}%`;
	}}