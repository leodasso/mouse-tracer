import { lerp } from '../calc';

export default class PathPoint {

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} t the time (in milliseconds) this point starts
     */
    constructor(x, y, t) {

        this.x = x;
        this.y = y;

        // Velocity
        this.vx = 0;
        this.vy = 0;

        this.gravity = 0;
        this.drag = .08;
        this.opacity = 100;
        // This is the opacity that gets lerped to
        this.finalOpacity = 100;
        this.t = t;
    }


    update() {
        this.opacity = lerp(this.opacity, this.finalOpacity, .09);
        // apply gravity to the point
        this.vy += this.gravity;
        // update the position of the point
        this.x += this.vx;
        this.y += this.vy;
        // apply drag to the point
        this.vx -= this.vx * this.drag;
        this.vy -= this.vy * this.drag;
    }
}