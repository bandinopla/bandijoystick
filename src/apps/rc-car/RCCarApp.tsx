import { useEffect, useRef } from "preact/hooks" 
import assetUrl from "./game.glb?url";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as BANDI from "bandijoystick";
import { lerp } from "three/src/math/MathUtils.js";
import { AxesHelper, Clock, DirectionalLight, Euler, HemisphereLight, Mesh, Object3D, PCFSoftShadowMap, PerspectiveCamera, Scene, Vector2, Vector3, WebGLRenderer } from "three";


export default function RCCarApp()
{
	const divRef = useRef<HTMLDivElement>(null);

	useEffect(()=>{

		const renderer = new WebGLRenderer();
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap; // optional, default is PCFShadowMap

		const camera = new PerspectiveCamera();
		const scene = new Scene();
		const clock = new Clock();
		const wheels :Object3D[] = [];
		let car : Object3D |undefined;
		let steerAngle = 0;
		let MAXSPEED = 3;
		const MAXDIST = 10;
		let speed = 0;
		let goalSpeed = 0;
		let speedScale = 0;

		let removed = false;

		const onResize = ()=>{
			renderer.setSize( window.innerWidth, window.innerHeight );
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix()
		}

		window.addEventListener("resize", onResize);
		divRef.current!.appendChild( renderer.domElement );
		onResize();

		//-------------------------------------------------------------------

		const render = ()=>{
			const delta = clock.getDelta(); 

			wheels.forEach(wheel=>{
				wheel.rotateX( speed * speedScale * 10 * delta)
			});

			if( car )
			{

				car.rotateY( steerAngle*2*delta*-speedScale*speed );

				speed = lerp(speed, goalSpeed, delta);

				//car.translateZ( speed * delta );
				const forward = new Vector3(0, 0, 1).applyQuaternion(car.quaternion);
				car.position.addScaledVector(forward, speed * delta *speedScale);

				if( car.position.length()>MAXDIST )
				{
					car.position.copy( car.position.setLength(MAXDIST) );
				}

				camera.lookAt(car.position )
			}

			renderer.render(scene, camera);
			if( !removed ) requestAnimationFrame(render);
		}

		requestAnimationFrame(render);

		//--------------------------------------------------------------------
		 
		camera.position.set(0,.2,2)
		scene.add(new HemisphereLight());
		
		//
		// load level....
		//
		new GLTFLoader().load(assetUrl, file=>{
			scene.add(file.scene);
			const cam = file.cameras[0] as PerspectiveCamera;
			camera.position.copy(cam.position);
			camera.quaternion.copy(cam.quaternion);
			camera.fov = cam.fov;
			camera.updateProjectionMatrix()

			file.scene.traverse(o=>{
				if( o instanceof DirectionalLight )
				{
					o.intensity = 1; 
					o.castShadow = true;
					o.shadow.bias = -0.0001;
					o.shadow.mapSize = new Vector2(1024,1024)
					o.shadow.camera.top = -MAXDIST;
					o.shadow.camera.bottom = MAXDIST;
					o.shadow.camera.left = -MAXDIST;
					o.shadow.camera.right = MAXDIST;
				}
				else if( o.userData.wheel )
				{
					wheels.push(o);
					o.add(new AxesHelper(0.1))
				}
				else if( o.name=='car' )
				{
					car = o;
				}

				if( o instanceof Mesh ){
					o.receiveShadow = true;
					o.castShadow = true;
				}
			});


			//#region wheel

			const wheelInput = new BANDI.DirKey({
				id:"wheel",
				radius:"200px",
				x:"25%",
				y:"50%",
				background:"#557B69"
			});

			const onWheelDir = ( dir:[x:number, y:number] )=>{

				const dx = -dir[0];
				const dy = dir[1];
 
				speedScale = dy? -Math.sign(dy) : -1 ; 

				steerAngle = Math.atan2(-1, dx)+Math.PI/2;  

				wheels.forEach(w=>{
					if( w.userData.wheel>0 )
					{
						//w.rotation.y = steerAngle;
						w.setRotationFromEuler(new Euler(0, steerAngle  , 0))
					}
				});
			}

			wheelInput.changed.on( onWheelDir );

			 
			//#endregion


			//#region brake
			const onBrake = ( isDown:boolean )=>{
			 
					goalSpeed = isDown? MAXSPEED : 0;
			}

			const brakeKey = new BANDI.PushKey({
				radius:"200px",
				x:"75%",
				y:"50%",
				id:"brake",
				iconClass:"wind", 
			});

			brakeKey.pressed.on(onBrake);

			//#endregion

			//----------------- CONTROLS ---------------------------
			const input = new BANDI.Joystick("Controls");

			input.setKeys([
				wheelInput,
				brakeKey
			]);

			//
			// add the UI showing the QR to the user.
			//
			input.domElement().then(el => {
				if (el) {
					el.style.position = "fixed";
					el.style.zIndex = "1";
					el.style.left = "50%";
					el.style.transform = " translate(-50%, 0%)";
					el.style.bottom = "0px";
					document.body.appendChild(el);
				}
			});

		});

		return ()=>{

			window.removeEventListener("resize", onResize);
			//TODO: cleanup
		}


	}, []);

	return <div ref={divRef}></div>
} 