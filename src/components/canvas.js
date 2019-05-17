import React, { Component } from "react";
import { domToCanvasCoords, lerp, randomRange} from "../calc";
import { perlin2, seed } from "../noisejs/perlin";
import Path from "../classes/Path";
import Axios from "axios";
import { setModeToDraw } from '../Events';

class Canvas extends Component {

	state = {
		mouseX: 0,
		mouseY: 0,
		pathPoints: [],				// points for the CURRENT drawing
		memorizedPaths: [],
		age: 0,						// in milliseconds
		duration: 5000,
		timerIntervalId: -99,
		startingWidth: 800,
		drawingEnabled: true,
	}

	componentDidMount() 
	{
		this.initCanvas();

		// add the begin drawing to the right event
		setModeToDraw.addListener(this.beginDrawing);
	}

	beginTimer = () => {
		//add a counter 
		const timerInterval = setInterval(this.increment, 20)
		this.setState({timerIntervalId: timerInterval});
	}

	beginDrawing = () => {

		console.log("beginning drawing...");

		this.beginTimer();

		// When the mouse moves, we want to update the state with it's new position
		window.addEventListener( "mousemove",
		event => {

			if (!this.state.drawingEnabled) return;

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
						t: this.state.age
					}],
			});
		},
		false
		);
	}


	// Increment the age of the component, and checks if drawing time is complete
	increment = () => {
		
		this.setState({age: this.state.age + 20});

		// draw each memorized path
		for (const path of this.state.memorizedPaths) {
			path.setAge(this.state.age);
		}

		// when the duration is complete, finish things up
		if (this.state.age > this.state.duration) {
			clearInterval(this.state.timerIntervalId);
			this.finishDrawing(this.state.drawingEnabled);
			this.setState({drawingEnabled: false});
		}
	}

	finishDrawing() {

		// upload the path
		Axios.put('/api/sketches', this.state.pathPoints)
		.then(() => {
			console.log('success');
		})
		.catch((error) => {
			console.log('error putting sketch', error);
		});

		this.exlpodePath();
	}


	exlpodePath() {
		// randomize the perlin noise
		seed( Math.round(randomRange(0, 32000)));

		for (let pt of this.state.pathPoints) {

			// Calculate a vector that each point will move to based on the perlin noise 
			// of it's position. This makes for a cool, smooth, curvy explosion
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



	updateCanvas = () => 
	{
		const canvas = this.refs.canvas;
		const ctx = canvas.getContext('2d');

		// clear everything drawn in previous frames
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// render the current mouse position
		if (this.state.drawingEnabled) {
			ctx.fillStyle = "hsl(100, 0%, 80%)";
			const canvasCoords = domToCanvasCoords(canvas, {x:this.state.mouseX, y:this.state.mouseY});
			ctx.beginPath();
			ctx.arc(canvasCoords.x, canvasCoords.y - 80, 10, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		}


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
		
		this.renderPath(this.state.pathPoints, ctx, canvas, 6);

		for (const path of this.state.memorizedPaths) {
			this.renderPath(path.renderPoints, ctx, canvas, 4);
		}

	}


	renderPath(pointsArray, ctx, canvas, width) {

		// render each point in the path
		for (let i = 1; i < pointsArray.length; i++) {

			const pt = pointsArray[i];
			const prevPt = pointsArray[i-1];
			const lifetime = this.state.age - pt.t;
			if (lifetime > this.state.duration) continue;

			const ratio = lifetime / this.state.duration;
			ctx.strokeStyle = `hsla(100, 50%, ${ratio * 100}%, ${pt.opacity}%)`;
			ctx.lineWidth = width * (1 - ratio);

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
