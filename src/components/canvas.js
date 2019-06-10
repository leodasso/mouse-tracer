import React, { Component } from "react";
import { domToCanvasCoords} from "../calc";
import { connect } from 'react-redux';
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
		lineLength: 0,
		maxLineLength: 2000,
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
	
			const newLength = currentDrawing.addPoint(event.screenX, event.screenY);
			this.increment(newLength);
		});
	}


	beginDrawing = () => {

		this.setState({ drawingEnabled: true });
		// clear out any previous drawings
		currentDrawing = new Path([], 6);
	}

	// Increment as progress is made on the drawing
	increment = (pathLength) => {
		
		this.setState({lineLength: pathLength});
		const isComplete = pathLength >= this.state.maxLineLength;

		if (isComplete) {
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
			if (isComplete) {
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

		// dispatch an event to upload this sketch to the server
		this.props.dispatch({
			type: 'ADD_SKETCH',
			payload: filteredPts,
		})

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
			currentDrawing.render(ctx, canvas, this.state.lineLength);
		}

		// run update behaviors for all the render points.
		// This has to happen in a sep loop so ALL points can be updated before any render
		for (const path of currentPaths) {
			path.update();
		}

		for (const path of currentPaths) {
			path.render(ctx, canvas, this.state.lineLength);
		}

	}


	render() {

		// get the remaining line length
		let remainingLine = (this.state.maxLineLength - this.state.lineLength) / 1000;
		// make it read as a clean 2 decimal number
		remainingLine = remainingLine.toFixed(2);
		// clamp to 0
		if (remainingLine < 0) remainingLine = 0;

		return (
			<div>
				<p>You have {remainingLine} left.</p>
				<canvas ref="canvas" className="canvas" />
			</div>
		);
	}
}

const mapStateToProps = (reduxState) => {
	return reduxState;
}

export default connect(mapStateToProps)(Canvas);