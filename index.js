const express = require('express');
const path = require('path');
const request = require('request');
const fs = require('fs');

const app = express();

//request('http://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv').pipe(fs.createWriteStream('pop.csv'));

// Create db connection

const { Client } = require('pg');

let client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// Detect local database environment, disable SSL
if(process.env.DATABASE_URL == ("postgresql:///" + process.env.USER) ) {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });
}

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});


// Serve static website at client/build/...
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