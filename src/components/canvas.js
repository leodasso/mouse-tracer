import React, { Component } from "react";
import { domToCanvasCoords, randomRange} from "../calc";
import { perlin2, seed } from "../noisejs/perlin";
import Path from "../classes/Path";
import Axios from "axios";
import { setModeToDraw, viewRandom, viewAll } from '../Events';
import PathPoint from '../classes/PathPoint';

// Array of all the points of the current drawing
let currentDrawing = [];
let currentPaths = [];
let mouseX = 0;
let mouseY = 0;

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
		viewAll.addListener(this.viewAll);

		// When the mouse moves, record the position
		window.addEventListener( "mousemove", event => {
			if (!this.state.drawingEnabled) return;

			mouseX = event.screenX;
			mouseY = event.screenY;
	
			currentDrawing.push( new PathPoint(
				event.screenX, 
				event.screenY, 
				this.state.age));
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
			currentPaths.push(newPath);
		})
		.catch(error => {
			console.log('error getting random sketch', error);
		})
	}

	viewAll = () => {
		// TODO


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
		for (let path of currentPaths) {

			if (!path) continue;

			path.setAge(this.state.age);

			// when the duration is complete, finish things up
			if (this.state.age > this.state.duration) {
				clearInterval(this.state.timerIntervalId);
				if (this.state.drawingEnabled) {
					this.finishDrawing();
				}

				else this.exlpodePath(path.renderPoints);

				this.setState({drawingEnabled: false});
			}
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

		// run update behaviors for all the render points.
		// This has to happen in a sep loop so ALL points can be updated before any render
		for (let path of currentPaths)
			this.updatePath(path.renderPoints);
		
		this.renderPath(currentDrawing, ctx, canvas, 6);

		for (let path of currentPaths)
			this.renderPath(path.renderPoints, ctx, canvas, 4);

	}

	updatePath(pointsArray) {
		for (let pt of pointsArray) pt.update();
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
