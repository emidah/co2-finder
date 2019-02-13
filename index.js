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

    // Return all available countries for queries of type co2 and pop
    app.get( '/api/:data/countries', (req, res) => {
        let dataSource = []

        if (req.params.data === "co2"){
            dataSource = db.co2_data
        } else if (req.params.data === "pop"){
            dataSource = db.pop_data
        }

        const responseData =  Array.from( dataSource.keys() ).map(x => {
            const obj = new Object();
            obj.name = dataSource.get(x)["Country Name"]
            obj.code = dataSource.get(x)["Country Code"]
            return obj
        })

        res.json(responseData)
    });

    // Return specific country co2 data
    app.get( '/api/:data/:country', (req,res) => {    
        let dataSource = []

        if (req.params.data === "co2"){
            dataSource = db.co2_data
        } else if (req.params.data === "pop"){
            dataSource = db.pop_data
        }

        if( Array.from(dataSource.keys()).includes(req.params.country)) {
            res.json(dataSource.get(req.params.country))
        } else {
            res.status(404).json("Country not found")
        }
    } );

    const port = process.env.PORT || 5000;
    app.listen(port);


    console.log("listening on port " + port)

}