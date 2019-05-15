import React, { Component } from "react";

class Canvas extends Component {

	state = {
		mouseX: 0,
		mouseY: 0,
	}

	componentDidMount() {

		this.initCanvas();

		// create an event for mouse move
		window.addEventListener(
			"mousemove",
			event => {
				this.setState({mouseX: event.screenX, mouseY: event.screenY});
			},
			false
		);
	}

	initCanvas() {

		// set width and heigght
		this.refs.canvas.width = 800;
		this.refs.canvas.height = 700;

		const ctx = this.refs.canvas.getContext('2d');
		
		setInterval(this.updateCanvas(ctx), 30);
	}


	updateCanvas = ctx => () => {

		// clear everything drawn in previous frames
		ctx.clearRect(0, 0, 800, 800);

		// draw a random line because reasons
		ctx.beginPath();
		ctx.moveTo(this.state.mouseX, this.state.mouseY);
		ctx.lineTo(Math.random() * 800, Math.random() * 700);
		ctx.stroke();
		ctx.closePath();
	}


	render() {

		return (
			<div>
				<canvas ref="canvas" className="canvas" />
			</div>
		);
	}
}

export default Canvas;
