import React, { Component } from "react";
import { domToCanvasCoords, randomRange, lerp} from "../calc";

class Canvas extends Component {

	state = {
		mouseX: 0,
		mouseY: 0,
		pathPoints: [],
		age: 0,						// in milliseconds
		duration: 5000,
		timerIntervalId: -99,
	}

	componentDidMount() 
	{
		//add a counter 
		const timerInterval = setInterval(this.increment, 20)
		this.setState({timerIntervalId: timerInterval});

		this.initCanvas();
		// When the mouse moves, we want to update the state with it's new position
		window.addEventListener( "mousemove",
			event => {

				if (!this.isDrawingTime()) return;

				this.setState({
					mouseX: event.screenX, 
					mouseY: event.screenY,
					pathPoints: [...this.state.pathPoints, 
						{
							x: event.screenX, 
							y: event.screenY, 
							// Velocity
							vx: 0,
							vy: 0,
							gravity: 0,
							drag: .02,
							opacity: 100,
							// This is the opacity that gets lerped to
							finalOpacity: 100,
							t: this.state.age}],
				});
			},
			false
		);
	}


	// Increment the age of the component, and checks if drawing time is complete
	increment = () => {
		
		this.setState({age: this.state.age + 20});

		if (this.state.age > this.state.duration) {
			clearInterval(this.state.timerIntervalId);
			this.exlpodePath();
		}
	}

	exlpodePath() {

		for (let pt of this.state.pathPoints) {
			pt.vx = randomRange(-8, 8);
			pt.vy = randomRange(-8, 8);
			pt.gravity = .1;
			pt.finalOpacity = 0;
		}
	}


	initCanvas() 
	{
		// set width and heigght
		this.refs.canvas.width = 800;
		this.refs.canvas.height = 700;
		
		setInterval(this.updateCanvas, 30);
	}

	isDrawingTime = () => this.state.age < this.state.duration;


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
		ctx.closePath();

		// render each point in the path
		for (let i = 1; i < this.state.pathPoints.length; i++) {

			const pt = this.state.pathPoints[i];
			const prevPt = this.state.pathPoints[i-1];
			const lifetime = this.state.age - pt.t;
			if (lifetime > this.state.duration) continue;

			pt.opacity = lerp(pt.opacity, pt.finalOpacity, .05);

			const ratio = lifetime / this.state.duration;
			ctx.strokeStyle = `hsla(100, 50%, ${ratio * 100}%, ${pt.opacity}%)`;
			ctx.lineWidth = 6 * (1 - ratio);

			const canvasCoords = domToCanvasCoords(canvas, {x:pt.x, y:pt.y});
			const prevCanvasCoords = domToCanvasCoords(canvas, {x:prevPt.x, y:prevPt.y});

			// apply gravity to the point
			pt.vy += pt.gravity;
			// update the position of the point
			pt.x += pt.vx;
			pt.y += pt.vy;
			// apply drag to the point
			pt.vx -= pt.vx * pt.drag;
			pt.vy -= pt.vy * pt.drag;

			ctx.beginPath();
			ctx.moveTo(prevCanvasCoords.x, prevCanvasCoords.y - 80);
			ctx.lineTo(canvasCoords.x, canvasCoords.y - 80);
			ctx.stroke();
			ctx.closePath();
		};
		
	}


	render() {

		// get the remaining time in seconds
		let remainingTime = (this.state.duration - this.state.age) / 1000;
		// make it read as a clean 2 decimal number
		remainingTime = remainingTime.toFixed(2);
		// clamp to 0
		if (remainingTime < 0) remainingTime = 0;

		return (
			<div>
				<p>Draw for {remainingTime} seconds!</p>
				<canvas ref="canvas" className="canvas" />
			</div>
		);
	}
}

export default Canvas;
