const Database = require('./Database.js')
const express = require('express');
const path = require('path');
const app = express();
const db = new Database();
const setup = db.initialize().then(() => {
    runApp()
})

function runApp() {
    // Serve static website at client/build/...
    app.use( express.static(path.join(__dirname, 'client/build') ));

    app.get( '/api/countries', (req, res) => {
        const countrynames =  Array.from( db.co2_data.keys() )
        res.json(countrynames)
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });

    const port = process.env.PORT || 5000;
    app.listen(port);


    console.log("listening on port " + port)

}