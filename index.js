const Database = require('./Database.js')
const express = require('express');
const path = require('path');
const app = express();

const db = new Database();
const setup = db.initialize().then(() => {
    runApp()
})

function runApp() {
    
    // --- WEBSITE ---
    
    app.use( express.static(path.join(__dirname, 'client/build') ));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'));
    });

    // --- API ---

    // Return all available country codes for co2 query
    app.get( '/api/co2/countries', (req, res) => {
        const countrynames =  Array.from( db.co2_data.keys() )
        res.json(countrynames)
    });

    // Return all available country codes for population query
    app.get( '/api/pop/countries', (req, res) => {
        const countrynames =  Array.from( db.pop_data.keys() )
        res.json(countrynames)
    });

    // Return country co2 data
    app.get( '/api/co2/:country', (req,res) => {    
        if( Array.from(db.co2_data.keys()).includes(req.params.country)) {
            res.json(db.co2_data.get(req.params.country))
        } else {
            res.status(404).json("Country not found")
        }
    } );

    // Return country population data
    app.get( '/api/pop/:country', (req,res) => {    
        if( Array.from(db.pop_data.keys()).includes(req.params.country)) {
            res.json(db.pop_data.get(req.params.country))
        } else {
            res.status(404).json("Country not found")
        }
    } );

    const port = process.env.PORT || 5000;
    app.listen(port);


    console.log("listening on port " + port)

}