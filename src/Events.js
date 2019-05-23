import Event from './classes/Event';

let viewRandom = new Event('set mode to view');
let setModeToDraw = new Event('set mode to draw');
let viewAll = new Event('View All');

export { viewRandom, setModeToDraw, viewAll };