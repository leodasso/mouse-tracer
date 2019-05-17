export default class Path {

    constructor(pathPoints) {
        this.pathPoints = pathPoints.map(pt => {
            return {
                x: pt.x,
                y: pt.y,
                t: pt.t,
                finalOpacity: 100,
                opacity: 100,
            }
        });
        this.renderPoints = [];

    }

    setAge(age) {

        let index = this.renderPoints.length - 1;
        if (index < 0) index = 0;

        const currentPt = this.pathPoints[index];

        if (!currentPt) return;
        
        // Once it's time for the path point to be added, add it to the renderPoints array
        if (age >= currentPt.t) {
            this.renderPoints.push(currentPt);
        }
    }
}