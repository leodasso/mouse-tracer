import React, { Component } from "react";
import { domToCanvasCoords, lerp, randomRange} from "../calc";
import { perlin2, seed } from "../noisejs/perlin";
import Path from "../classes/Path";
import Axios from "axios";
import { setModeToDraw, viewRandom } from '../Events';

// Array of all the points of the current drawing
let currentDrawing = [];
let mouseX = 0;
let mouseY = 0;

let viewedDrawing = null;

class Canvas extends Component {

	state = {
		age: 0,						// in milliseconds
		duration: 5000,
		timerIntervalId: -99,
		startingWidth: 800,
		drawingEnabled: false,
		viewing: false,
	}

	componentDidMount() 
	{
		this.initCanvas();

		// add the begin drawing to the right event
		setModeToDraw.addListener(this.beginDrawing);

		viewRandom.addListener(this.viewRandom);

		// When the mouse moves, record the position
		window.addEventListener( "mousemove", event => {
			if (!this.state.drawingEnabled) return;

			mouseX = event.screenX;
			mouseY = event.screenY;
	
			currentDrawing.push({
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
			})
		});
	}

	beginTimer = () => {
		//add a counter 
		const timerInterval = setInterval(this.increment, 20)
		this.setState({timerIntervalId: timerInterval, age: 0});
	}

	viewRandom = () => {

		// request for a random drawing
		Axios.get('/api/sketches/random')
		.then( response => {
			this.beginTimer();
			const newPath = new Path(response.data);
			viewedDrawing = newPath;
		})
		.catch(error => {
			console.log('error getting random sketch', error);
		})
	}

	beginDrawing = () => {

		this.beginTimer();
		this.setState({ drawingEnabled: true });
		// clear out any previous drawings
		currentDrawing = [];
	}

	// Increment the age of the component, and checks if drawing time is complete
	increment = () => {
		
		this.setState({age: this.state.age + 20});

		// draw each memorized path 
		if (viewedDrawing)
			viewedDrawing.setAge(this.state.age);

		// when the duration is complete, finish things up
		if (this.state.age > this.state.duration) {
			clearInterval(this.state.timerIntervalId);
			if (this.state.drawingEnabled) {
				this.finishDrawing();
			}

			else if (viewedDrawing) {
				this.exlpodePath(viewedDrawing.renderPoints);
			}

			this.setState({drawingEnabled: false});
		}
	}

	finishDrawing() {

		this.setState({drawingEnabled: false});

		// clean the path info so the payload isn't so big
		const filteredPts = currentDrawing.map( pt => {
			return {
				x: pt.x,
				y: pt.y,
				t: pt.t,
			}
		})

		// upload the path
		Axios.put('/api/sketches', filteredPts)
		.then(() => {
			console.log('success');
		})
		.catch((error) => {
			console.log('error putting sketch', error);
		});

		this.exlpodePath(currentDrawing);
	}


	exlpodePath(pathArray) {
		// randomize the perlin noise
		seed( Math.round(randomRange(0, 32000)));

		for (let i = 0; i < pathArray.length; i++) {

			const pt = pathArray[i];

			// Calculate a vector that each point will move to based on the perlin noise 
			// of it's position. This makes for a cool, smooth, curvy explosion
			const noiseScale = .002;
			const power = 20;
			let radians = perlin2(pt.x * noiseScale, (pt.y + i * 2) * noiseScale) * Math.PI * 2;

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
			const canvasCoords = domToCanvasCoords(canvas, {x:mouseX, y:mouseY});
			ctx.beginPath();
			ctx.arc(canvasCoords.x, canvasCoords.y - 80, 10, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		}


		// update each point in the path
		this.updatePath(currentDrawing);

		if (viewedDrawing) 
			this.updatePath(viewedDrawing.renderPoints);
		
		this.renderPath(currentDrawing, ctx, canvas, 6);

		if (viewedDrawing)
			this.renderPath(viewedDrawing.renderPoints, ctx, canvas, 4);

	}

	updatePath(pointsArray) {
		for (let i = 1; i < pointsArray.length; i++) {

			const pt = pointsArray[i];

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
