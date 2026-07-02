const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello from Jenkins CD Pipeline!'));
app.listen(3000);
module.exports = app;
