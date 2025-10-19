import nipplejs from 'nipplejs';
import styles from "./Stick.module.css";

export class Stick {
	onMove?:(x:number, y:number)=>void;

	readonly dispose: VoidFunction;

	readonly setColor:(color:string)=>void;

	constructor( parent:HTMLDivElement, radius=200 ) {
		var manager = nipplejs.create({ 
										zone: parent,
										position: { left:"50%", top:"50%"},
										mode:"static",
										color:"white",  
										size: radius
									}); 
			
			manager.on('move', (evt, data) => {  
					this.onMove?.(data.vector.x, data.vector.y)
			});

			manager.on("end", ()=>{
				this.onMove?.(0, 0)
			})

			this.setColor = color => {
				manager.get(0).ui.front.style.backgroundColor = color;
			}
	 
			manager.get(0).ui.el.classList.add( styles.stick );
			manager.get(0).ui.back.classList.add( styles.bg );
			manager.get(0).ui.front.classList.add( styles.btn );

			this.dispose = ()=>manager.destroy()
	}
}