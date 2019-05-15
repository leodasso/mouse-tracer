import React, { Component } from "react";
import { domToCanvasCoords} from "../calc";

class Canvas extends Component {


	state = {
		mouseX: 0,
		mouseY: 0,
		pathPoints: [],
		age: 0,						// in milliseconds
	}


	componentDidMount() 
	{

		//add a counter 
		setInterval(() => {
			this.setState({age: this.state.age + 20});
		}, 20)


		this.initCanvas();
		// When the mouse moves, we want to update the state with it's new position
		window.addEventListener( "mousemove",
			event => {
				this.setState({
					mouseX: event.screenX, 
					mouseY: event.screenY,
					pathPoints: [...this.state.pathPoints, {x: event.screenX, y: event.screenY, t: this.state.age}],
				});
			},
			false
		);
	}


	initCanvas() 
	{
		// set width and heigght
		this.refs.canvas.width = 800;
		this.refs.canvas.height = 700;
		
		setInterval(this.updateCanvas, 30);
	}


	updateCanvas = () => 
	{
		const canvas = this.refs.canvas;
		const ctx = canvas.getContext('2d');

		// clear everything drawn in previous frames
		ctx.clearRect(0, 0, 800, 800);

		// render the current mouse position
		ctx.fillStyle = "hsl(100, 0%, 80%)";
		const canvasCoords = domToCanvasCoords(canvas, {x:this.state.mouseX, y:this.state.mouseY});
		ctx.beginPath();
		ctx.arc(canvasCoords.x, canvasCoords.y - 80, 10, 0, 2 * Math.PI);
		ctx.fill();

		// render the full path
		for (let pt of this.state.pathPoints) {

			const lifetime = this.state.age - pt.t;
			if (lifetime > 8000) continue;

			const ratio = lifetime / 8000;
			ctx.fillStyle = `hsl(100, 50%, ${ratio * 100}%)`;
			const canvasCoords = domToCanvasCoords(canvas, {x:pt.x, y:pt.y});
			ctx.beginPath();
			ctx.arc(canvasCoords.x, canvasCoords.y - 80, 2, 0, 2 * Math.PI);
			ctx.fill();	
			
		};
	}


	render() {

		return (
			<div>
				<p>{this.state.age}</p>
				<canvas ref="canvas" className="canvas" />
			</div>
		);
	}
}

export default Canvas;
