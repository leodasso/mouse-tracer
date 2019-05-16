const express = require('express');
const router = express.Router();
const sketches = require('./sketchesArray');


router.put('/', (req, resp) => {

    sketches.push;
    resp.sendStatus(201);
});

module.exports = router;