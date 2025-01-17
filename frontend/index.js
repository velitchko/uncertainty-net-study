const bodyParser = require('body-parser');
const express = require('express');
const { join } = require('path');

const DIST_FOLDER = join(process.cwd(), 'dist/uncertainty-net-survey');

const app = express();

app.use(express.static(join(DIST_FOLDER)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/env', envRouter);
// get router
app.use(function (req, res, next) {
    res.sendFile(join(DIST_FOLDER, 'index.html'), { req });
});

app.listen(4300, () => {
    console.log('Server listening on http://localhost:4200');
});