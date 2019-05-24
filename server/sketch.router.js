const express = require('express');
const router = express.Router();
const sketches = require('./sketchesArray');


router.put('/', (req, resp) => {

    // console.log('adding a sketch with', req.body.length, ' points.' );
    console.log(req.connection.remoteAddress);

    // make sure we're not receiving gigantic arrays
    if (req.body.length > 2000) {
        console.log('too many data points in this sketch.');
        resp.sendStatus(501);
        return;
    }

    // sanitize the path points
    const cleanPath = [];
    for (let pt of req.body) 
        cleanPath.push({x: pt.x, y: pt.y, t: pt.t});

    const sketch = {
        timestamp: Date.now(),
        ip: req.connection.remoteAddress,
        path: cleanPath,
    }

    sketches.push(sketch);
    resp.sendStatus(201);
});


/**
 * Returns the array `sketches` 
 * each sketch is an object with `timestamp`, `ip`, and `path`
 * `path` is the array of points which make up the actual drawing
 */
router.get('/', (req, resp) => {

    resp.send({sketches});
});


router.get('/random', (req, resp) => {

    if (sketches.length < 1) {
        console.log("there's no sketches, so can't send a random one back!");
        resp.sendStatus(501);
        return;
    }

    const sketch = randomElementFromArray(sketches);
    resp.send(sketch);
})


router.get('/all', (req, resp) => {

    if (sketches.length < 1) {
        console.log('there are no sketches, cant send back an array of them');
        resp.sendStatus(501);
        return;
    }

    const max = 50;
    const limitedArray = sketches.slice(Math.max(0, sketches.length - max));

    resp.send(limitedArray);
});


function randomElementFromArray(array) {
	const random = Math.random() * array.length;
	return array[Math.floor(random)];
}


module.exports = router;