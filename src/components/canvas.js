import React, { Component } from "react";
import { domToCanvasCoords, lerp, randomRange} from "../calc";
import { perlin2, seed } from "../noisejs/perlin";


class Canvas extends Component {

	state = {
		mouseX: 0,
		mouseY: 0,
		pathPoints: [],
		age: 0,						// in milliseconds
		duration: 5000,
		timerIntervalId: -99,
		startingWidth: 800,
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
							drag: .08,
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

		// randomize the perlin noise
		seed( Math.round(randomRange(0, 32000)));

		for (let pt of this.state.pathPoints) {

			const noiseScale = .003;
			const power = 20;
			let radians = perlin2(pt.x * noiseScale, pt.y * noiseScale) * Math.PI * 2;

			pt.vx = Math.cos(radians) * power;
			pt.vy = Math.sin(radians) * power;
			pt.gravity = .1;
			pt.finalOpacity = 0;
		}
	}


	initCanvas() 
	{
		// set width and heigght
		this.refs.canvas.width = window.innerWidth;
		this.refs.canvas.height = 600;
		
		setInterval(this.updateCanvas, 30);
	}

	isDrawingTime = () => this.state.age < this.state.duration;


	updateCanvas = () => 
	{
		const canvas = this.refs.canvas;
		const ctx = canvas.getContext('2d');

		// clear everything drawn in previous frames
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// render the current mouse position
		ctx.fillStyle = "hsl(100, 0%, 80%)";
		const canvasCoords = domToCanvasCoords(canvas, {x:this.state.mouseX, y:this.state.mouseY});
		ctx.beginPath();
		ctx.arc(canvasCoords.x, canvasCoords.y - 80, 10, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();


		// update each point in the path
		for (let i = 1; i < this.state.pathPoints.length; i++) {

			const pt = this.state.pathPoints[i];

			pt.opacity = lerp(pt.opacity, pt.finalOpacity, .09);
			// apply gravity to the point
			pt.vy += pt.gravity;
			// update the position of the point
			pt.x += pt.vx;
			pt.y += pt.vy;
			// apply drag to the point
			pt.vx -= pt.vx * pt.drag;
			pt.vy -= pt.vy * pt.drag;
		};
		

		// render each point in the path
		for (let i = 1; i < this.state.pathPoints.length; i++) {

			const pt = this.state.pathPoints[i];
			const prevPt = this.state.pathPoints[i-1];
			const lifetime = this.state.age - pt.t;
			if (lifetime > this.state.duration) continue;

			const ratio = lifetime / this.state.duration;
			ctx.strokeStyle = `hsla(100, 50%, ${ratio * 100}%, ${pt.opacity}%)`;
			ctx.lineWidth = 6 * (1 - ratio);

			const canvasCoords = domToCanvasCoords(canvas, {x:pt.x, y:pt.y});
			const prevCanvasCoords = domToCanvasCoords(canvas, {x:prevPt.x, y:prevPt.y});

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
