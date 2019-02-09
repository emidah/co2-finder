const express = require('express');
const path = require('path');
const app = express();

app.use( express.static(path.join(__dirname, 'client/build') ));

app.get( '/api/countries', (req, res) => {
    const test = ['1','2', '3']
    res.json(test)
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });

const port = process.env.PORT || 5000;
app.listen(port);

console.log("listening on port " + port)