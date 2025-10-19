import styles from "./WebcamApp.module.css";
import { useEffect, useRef, useState } from "preact/hooks";

export function StaticNoise() {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {

		const ctx = canvas.current!.getContext('2d', { willReadFrequently: false })!;
		const frames: ImageData[] = [];
		const FRAME_COUNT = 6;        // how many frames to precompute (loop length)
		const ALPHA = 0.18;           // overlay opacity (also set via CSS)

		function resize() {
			// canvas.current!.width = innerWidth;
			// canvas.current!.height = innerHeight;
			 
			precomputeFrames();
		} 

		function precomputeFrames() {
			frames.length = 0;
			const w = 200, h = 200;
			for (let f = 0; f < FRAME_COUNT; f++) {
				const id = ctx.createImageData(w, h);
				const buf = id.data; // Uint8ClampedArray
				// fill buf: R,G,B = random, A = 255
				// use crypto for faster/stronger random bytes
				const rnd = new Uint8Array(w * h);
				for (let i = 0; i < rnd.length; i += 12)
					crypto.getRandomValues(rnd.subarray(i, i + 12));

				for (let i = 0, p = 0; i < rnd.length; i++, p += 4) {
					const v = rnd[i]*.3 + 100 ;
					buf[p] = v;
					buf[p + 1] = v;
					buf[p + 2] = v;
					buf[p + 3] = 255;
				}
				frames.push(id);
			}
		}

		let removed = false;
		let idx = 0;
		let last = 0;
		const FPS = 33; // perceived noise framerate (lower = cheaper)
		function loop(t: number) {

			if (removed) return;

			if (!last) last = t;
			const dt = t - last;
			if (dt >= 1000 / FPS) {
				ctx.putImageData(frames[idx], 0, 0);
				idx = (idx + 1) % frames.length;
				last = t;
			}

			requestAnimationFrame(loop);
		}

		addEventListener('resize', resize, { passive: true });
		resize();
		requestAnimationFrame(loop);

		return () => {
			removeEventListener('resize', resize);
			removed = true;
		}

	}, []);

	return <canvas ref={canvas} className={styles.noise} width={200} height={200}></canvas>
}