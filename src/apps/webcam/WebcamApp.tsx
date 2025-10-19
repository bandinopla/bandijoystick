import { useEffect, useRef, useState } from "preact/hooks";
import * as BANDI from "bandijoystick";
import styles from "./WebcamApp.module.css"; 
import { StaticNoise } from "./StaticNoise"; 



export default function WebcamApp() {
	const video = useRef<HTMLVideoElement>(null);
	const input = useRef<BANDI.Joystick>();
	const [cameraStream, setCameraStream] = useState<MediaStream>();

	useEffect(() => {

		input.current = new BANDI.Joystick("Video");

		const camera = new BANDI.CameraStream({
			x: "50%",
			y: "50%",
			radius: "100%",
			id: "cam"
		});

		const stopStreamBtn = new BANDI.PushKey({
			id:"stop",
			radius:"100px",
			iconClass:"x",
			x:"50%",
			y:"90%",
			visible: false,
			onClicked: ()=>{
				console.log("Tell peer to stop the video...")
				camera.stopCameraStream(); 
			}
		})

		input.current.setKeys([
			camera,
			stopStreamBtn
		]);

		camera.onStream.on(stream => { 
			
			setCameraStream(stream)

			if( stream )
			{
				console.log("Stream is set", stream)
				stopStreamBtn.visible = true;
			} 
			else 
			{
				stopStreamBtn.visible = false;
				console.log("Peer ended the video stream...", stream)
			}
		});

		//
		// QR code...
		//
		input.current.domElement().then(el => {
			if (el) {
				el.style.position = "fixed";
				el.style.zIndex = "1";
				el.style.left = "50%";
				el.style.transform = " translate(-50%, 0%)";
				el.style.bottom = "0px";
				document.body.appendChild(el);
			}
		});

	}, [])

	return <div className={styles.root}>
		{!cameraStream && <StaticNoise />}
		{cameraStream && <video ref={video} autoPlay srcObject={cameraStream}></video>}
	</div>
}