const express = require('express');
const bodyParser = require('body-parser');
const sketchRouter = require('./sketch.router');

// create the express app
const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(bodyParser.json());

// ROUTES
app.use('/api/sketches', sketchRouter);

app.listen(PORT, () => {
    console.log('Tracer server is live on port', PORT);
})