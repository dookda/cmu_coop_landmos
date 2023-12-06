const express = require('express');
const app = express();


// app.get('/', (req, res) => res.send('Hello World!'));
// static files
app.use(express.static('www'));


const port = 3000;
app.listen(port, () => console.log(`http://localhost:${port}`));