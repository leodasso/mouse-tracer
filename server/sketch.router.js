const express = require('express');
const router = express.Router();
const sketches = require('./sketchesArray');


router.put('/', (req, resp) => {

    console.log('adding a sketch with', req.body.length, ' points.' );

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

    sketches.push(cleanPath);
    resp.sendStatus(201);
});



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


function randomElementFromArray(array) {
	const random = Math.random() * array.length;
	return array[Math.floor(random)];
}

module.exports = router;