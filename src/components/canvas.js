import React, { Component } from "react";
import { domToCanvasCoords, randomRange} from "../calc";

import Path from "../classes/Path";
import Axios from "axios";
import { setModeToDraw, viewRandom, viewAll } from '../Events';

// Array of all the points of the current drawing
let currentDrawing;
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

			if (!this.state.drawingEnabled || !currentDrawing) return;

			mouseX = event.screenX;
			mouseY = event.screenY;
	
			currentDrawing.addPoint(event.screenX, event.screenY, this.state.age);
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

			currentPaths = [];
			this.beginTimer();
			const newPath = new Path(response.data.path);
			currentPaths.push(newPath);
		})
		.catch(error => {
			console.log('error getting random sketch', error);
		})
	}


	viewAll = () => {
		
		Axios.get('/api/sketches/all')

		.then( response => {
			// clear out the array of paths
			currentPaths = [];
			for (let sketch of response.data) {
				currentPaths.push(new Path(sketch.path));
			}

			this.beginTimer();
		})

		.catch(error => {
			console.log('error getting sketches', error);
		})

	}

	beginDrawing = () => {

		this.beginTimer();
		this.setState({ drawingEnabled: true });
		// clear out any previous drawings
		currentDrawing = new Path([], 6);
	}

	// Increment to the next update frame
	increment = () => {
		
		this.setState({age: this.state.age + 20});

		const timeFinished = this.state.age > this.state.duration;

		if (timeFinished) {
			clearInterval(this.state.timerIntervalId);
			if (this.state.drawingEnabled) {
				this.finishDrawing();
				this.setState({drawingEnabled: false});
			}
		}

		// set the correct time on each memorized path
		for (let path of currentPaths) {

			if (!path) continue;
			path.setAge(this.state.age);

			// when the duration is complete, finish things up
			if (timeFinished) {
				console.log('exploding path', path);
				path.explode();
			}
		}
	}


	finishDrawing() {

		this.setState({drawingEnabled: false});

		// clean the path info so the payload isn't so big
		const filteredPts = currentDrawing.pathPoints.map( pt => {
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

		currentDrawing.explode();
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


		// Update and render the current drawing
		if (currentDrawing) {
			currentDrawing.update();
			currentDrawing.render(ctx, canvas, this.state.age);
		}

		// run update behaviors for all the render points.
		// This has to happen in a sep loop so ALL points can be updated before any render
		for (const path of currentPaths) {
			path.update();
		}

		for (const path of currentPaths) {
			path.render(ctx, canvas, this.state.age);
		}

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