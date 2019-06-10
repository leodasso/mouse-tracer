import PathPoint from './PathPoint';
import { perlin2, seed } from "../noisejs/perlin";
import { domToCanvasCoords, randomRange, distance} from "../calc";

export default class Path {

    constructor(pathPoints, width = 4) {
        this.pathPoints = pathPoints;
        this.renderPoints = [];
        this.width = width;
        this.length = 0;
    }


    update() {
        for (const pt of this.renderPoints) {
            pt.update();
        }
    }


    render(ctx, canvas, age) {

		// render each point in the path
		for (let i = 1; i < this.renderPoints.length; i++) {

			const pt = this.renderPoints[i];
			const prevPt = this.renderPoints[i-1];
			const lifetime = age - pt.t;

			const ratio = lifetime / 15000;
			ctx.strokeStyle = `hsla(100, 50%, ${ratio * 100}%, ${pt.opacity}%)`;
			ctx.lineWidth = this.width * (1 - ratio);

			const canvasCoords = domToCanvasCoords(canvas, {x:pt.x, y:pt.y});
			const prevCanvasCoords = domToCanvasCoords(canvas, {x:prevPt.x, y:prevPt.y});

			ctx.beginPath();
			ctx.moveTo(prevCanvasCoords.x, prevCanvasCoords.y - 80);
			ctx.lineTo(canvasCoords.x, canvasCoords.y - 80);
			ctx.stroke();
			ctx.closePath();
		};
    }

    addPoint(x, y, time) {

        // get the previous point so we can determine the length of this segment
        if (this.pathPoints.length > 0) {
            const prevPoint = this.pathPoints[this.pathPoints.length-1];
            const segmentLength = distance(prevPoint.x, prevPoint.y, x, y);

            // set a minimum segment length (in pixels)
            if (segmentLength < 5) return this.length;

            this.length += segmentLength;
        }

        const newPoint = new PathPoint(x, y, time);
        this.pathPoints.push(newPoint);
        this.renderPoints.push(newPoint);

        return this.length;
    }
    

    setAge(age) {

        let index = this.renderPoints.length - 1;
        if (index < 0) index = 0;

        const currentPt = this.pathPoints[index];

        if (!currentPt) return;
        
        // Once it's time for the path point to be added, add it to the renderPoints array
        if (age >= currentPt.t) {
            this.renderPoints.push(new PathPoint(currentPt.x, currentPt.y, currentPt.t) );
        }
    }



    /** Using perlin noise, 'explodes' the path by assigning a velocity to each
     * point, so it kind of pulls apart and fades out. This is basically just a cool
     * way of erasing it from the canvas.
     * 
     * This is not an update function - just call it once to initiate the 'exploding'
     */
    explode() {
		// randomize the perlin noise
		seed( Math.round(randomRange(0, 32000)));

		for (let i = 0; i < this.renderPoints.length; i++) {

			const pt = this.renderPoints[i];

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
}