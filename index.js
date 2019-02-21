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
            obj.value = dataSource.get(x)["Country Code"]
            obj.label = dataSource.get(x)["Country Name"]
            return obj
        })

        res.json(responseData)
    });

    // Return specific country co2 data
    app.get( '/api/:data/countries/:country', (req,res) => {    
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

    app.get( '/api/:data/top/:count', (req,res) => {
        let data = []
        //console.log(req.params.data)
        if(req.params.data === "co2"){
            data = Array.from(db.co2_data.values())
        } else {
            data = Array.from(db.pop_data.values())
        }

        let max = 2000;
        for(let i = 2010; i<3000; i++){
            if(!(i in data[0]) || data[0][i] === ''){
                max = i - 1;
                break;
            }
        }

        //console.log(max)
        //filter out all the non-country data
        data = data.map(x => {
            if(! (x["Country Name"].includes('total') 
            || x["Country Name"].includes('World')
            || x["Country Name"].includes('income')
            || x["Country Name"].includes('IBRD')
            || x["Country Name"].includes('demographic')
            || x["Country Name"].includes('Asia')
            || x["Country Name"].includes('Euro')
            || x["Country Name"].includes('America')
            || x["Country Name"].includes('OECD')
            || x["Country Name"].includes('Africa')
            )) return x
        })
        data.sort( (a,b) => {
            if ((a[max] === "" && b[max] !== "" ) || parseFloat(a[max]) < parseFloat(b[max])){
                return 1
            }
            if ( (a[max] !== "" && b[max] === "" ) || parseFloat(a[max]) > parseFloat(b[max])) {
                return -1
            }
            return 0
        })
        res.json(data.slice(0,req.params.count))

    });

    const port = process.env.PORT || 5000;
    app.listen(port);


    console.log("listening on port " + port)

}