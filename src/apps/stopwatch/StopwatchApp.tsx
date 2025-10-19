import { useEffect, useRef, useState } from "preact/hooks";
import styles from "./StopwatchApp.module.css";
import { memo } from "preact/compat";
import * as BANDI from "bandijoystick"; 


function formatTime(ms: number) {
	const h = Math.floor(ms / 3600000)
	const m = Math.floor(ms / 60000) % 60
	const s = Math.floor(ms / 1000) % 60
	const msPart = Math.floor(ms % 1000)
	const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(3, '0')}`
	let i = formatted.search(/[1-9]/);
	const j = formatted.search(/\./);
	if (j < i || i < 0) {
		i = j
	}
	return `<span class="${styles.zeros}">${formatted.slice(0, i)}</span><span class="${styles.digits}">${formatted.slice(i, j)}</span><span class="${styles.ms}">${formatted.slice(j)}</span>`

}

const LapsDisplay = memo(({ laps, lessIsBetter }: { laps: number[], lessIsBetter: boolean }) => {

	const max = laps.reduce((a, b) => Math.max(a, b));

	return <div className={styles.lapsBars}>
		{laps.map((lapTime, i) => <div key={i} style={{ height: ((lapTime / max) * 100) + "%" }}></div>)}
		<span className={styles.lapCount}>{laps.length}</span>
	</div>
}, (prev, curr) => prev.laps.length == curr.laps.length);

export default function StopWatchApp() {

	const [time, setTime] = useState(0);
	const [laps, setLaps] = useState<number[]>([]);
	const [lapTime, setLapTime] = useState(0);
	const [lessIsBetter, setLessIsBetter] = useState(true);
	const input = useRef<BANDI.Joystick>();

	const [running, setRunning] = useState(false);
	const tickFlag = useRef(false);


	const reset = () => {
		setLapTime(0);
		setTime(0);
		setLaps([]);
	};

	const lap = () => {

		setLapTime(lapTime => {
			setLaps(v => [...v, lapTime]);
			return 0;
		});
	}

	const foo = () => {
		if (running) {
			lap();
		}
		else {
			setRunning(true);
		}
	}

	useEffect(() => {

		if (running) {
			let lms = 0;

			tickFlag.current = true;

			requestAnimationFrame(function tick() {

				if (lms == 0) {
					lms = performance.now();
				}

				const ms = performance.now();
				const delta = ms - lms;

				setTime(v => v + delta);
				setLapTime(v => v + delta);

				lms = ms;

				if (tickFlag.current) {
					requestAnimationFrame(tick)
				}

			});
		}
		else {
			tickFlag.current = false;
		}

	}, [running]);

	useEffect(() => {

		input.current = new BANDI.Joystick("Control");

		//
		// hide/show the buttons relevant to the state...
		//
		const setState = (state: BANDI.Key[]) => {

			buttons.forEach(key => {
				key.visible = state.includes(key);
			})

		}

		const mainBtnCfg = {
			x: "25%",
			y: "50%",
			radius: "200px",
		}

		const secondaryBtnCfg = {
			x: "75%",
			y: "50%",
			radius: "150px",
		}

		const btnStart = new BANDI.PushKey({
			...mainBtnCfg as any,
			x: "50%",
			iconClass: "play",
			id: "play",
			onClicked: () => {
				setRunning(true)
				setState(states.playing);
			}
		});

		const btnResume = new BANDI.PushKey({
			...mainBtnCfg as any,
			iconClass: "play",
			id: "resume",
			onClicked: () => {
				setRunning(true)
				setState(states.playing);
			}
		});

		const btnPause = new BANDI.PushKey({
			...mainBtnCfg as any,
			iconClass: "pause",
			id: "pause",
			onClicked: () => {
				setRunning(false)
				setState(states.paused);
			}
		});

		const btnLap = new BANDI.PushKey({
			...secondaryBtnCfg as any,
			iconClass: "flag",
			id: "lap",
			onClicked: () => lap()
		});

		const btnStop = new BANDI.PushKey({
			...secondaryBtnCfg as any,
			iconClass: "x",
			id: "stop",
			onClicked: () => {
				reset()
				setRunning(false)
				setState(states.initial);
			}
		});

		const buttons = [
			btnStart,
			btnPause,
			btnResume,
			btnLap,
			btnStop
		];

		const states = {
			initial: [btnStart],
			playing: [btnPause, btnLap],
			paused: [btnResume, btnStop],
		}

		setState(states.initial);

		input.current.setKeys(buttons);

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

	}, []);

	return <div className={styles.root} >

		{laps.length > 0 && <LapsDisplay laps={laps} lessIsBetter={lessIsBetter} />}
		<div className={styles.mainDigits} dangerouslySetInnerHTML={{ __html: formatTime(lapTime) }}></div>
		{laps.length > 0 && <div className={styles.subDigits} dangerouslySetInnerHTML={{ __html: formatTime(time) }}></div>}


	</div>
}