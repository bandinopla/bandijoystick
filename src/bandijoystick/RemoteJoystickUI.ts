import jsQR from "jsqr";
import * as BANDI from 'bandijoystick';
import { RemoteBandiJoystick } from './ui/RemoteBandiJoystick';
import "./ui/base-joystick.css";
import { isMobileByUserAgent } from "../utils/isMobile";

/*********************************************************************************
 * 
 * 						this is the UI app shown in the phone
 * 
 * *******************************************************************************
 */

//(screen.orientation as any).lock?.('landscape').catch(() => { });
document.addEventListener('contextmenu', e => e.preventDefault());

function startWebcamFeed(callback: (url?: string, error?: string) => void) {
	navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
		const video = document.createElement('video');
		video.srcObject = stream;
		video.autoplay = true;
		video.playsInline = true;
		video.style.position = 'fixed';
		video.style.top = '0';
		video.style.left = '0';
		video.style.width = '100vw';
		video.style.height = '100vh';
		video.style.objectFit = 'cover';
		document.body.appendChild(video);

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) throw new Error("Try again...");

		function getVideoFrame(video: HTMLVideoElement) {
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx!.drawImage(video, 0, 0);
			return ctx!.getImageData(0, 0, canvas.width, canvas.height);
		}

		function stopWebcam() {
			stream.getTracks().forEach(track => track.stop());
			video.remove()
			canvas.remove();
		}

		function frameLoop() {
			const frame = getVideoFrame(video);

			const code = jsQR(frame.data, frame.width, frame.height);

			console.log(code)

			if (code) {
				stopWebcam();

				// const regex = /\?slot=(?<code>[^&]+)/gm;
				// const meta = regex.exec(code.data);
				//if( meta && meta.groups?.code )
				// {
				// 	callback(meta.groups?.code)
				// }
				// else 
				// {
				// 	callback(undefined,"Invalid code")
				// }
				callback(code.data);
			}
			else {
				// process frame
				requestAnimationFrame(frameLoop);
			}


		}

		video.addEventListener('loadedmetadata', () => {
			requestAnimationFrame(frameLoop);
		});
	},
		err => {
			console.log("Heeee capo, no hay webcam...")
			callback(undefined, "Camera access failed. Check browser permissions or if another app is using it.");
		})
		;
}

let busy = false;

const indication = document.createElement("div");
var indicationInterval = 0;
const INITIAL_TEXT = "TAP to SCAN QR-CODE";
indication.classList.add("full-screen-message");
document.body.appendChild(indication);

indication.addEventListener("touchstart", ev => {
	clearInterval(indicationInterval);

	if (busy) return;

	busy = true;

	startWebcamFeed((url, error) => {

		if (!url) {
			error = error ?? "No QR code found...";
		}

		if (error) {

			busy = false;
			indication.innerText = "ERROR: " + error;
			indication.classList.add("error");
		}
		else {
			
			console.log("URL = ", url)
			indication.innerText = "Opening...";
			window.open(url, "_self");
		}
	});

});

/**
 * 
 */
if (BANDI.Joystick.urlCode()) { 

	busy = true;
	indication.innerHTML = `<span class="loader"></span>`;

	let joystick:BANDI.Joystick;

	try
	{
		joystick = new RemoteBandiJoystick();
	}
	catch(err)
	{ 
		indication.innerText = "ERROR: "+ err; 

		indicationInterval = window.setTimeout(() => {
				busy = false;
				indication.innerText = INITIAL_TEXT;
			}, 2000); 
	}
	
	if( joystick )
	{
		joystick.connected.on(() => indication.remove());
		joystick.disconnected.on(() => {

			//todo: show button to re-scan QR code...
			indication.innerText = "Conection lost...";
			document.body.appendChild(indication);

			indicationInterval = window.setTimeout(() => {
				busy = false;
				indication.innerText = INITIAL_TEXT;
			}, 2000);

		});
	}


}
else {

	indication.innerText = INITIAL_TEXT;
} 